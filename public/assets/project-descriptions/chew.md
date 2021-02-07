![screenshot of Chew](./assets/project-images/chew_main.png)

## Chew at a glance

To begin a Chew session, a user first visits the homepage and enters their name and location. Chew then directs them to their session page and presents them with a link they can send their friends. When friends click on the link, they are brought to the same session page that prompts them for their name. If they don't enter their name, they get a read-only view of the session, in which they can see restaurants others have added but are unable to vote on them or add their own restaurant picks. Once they add their name, they have joined the session and then have the privileges to add and vote on restaurants.

Users search for a restaurant by typing in keywords and optionally modifying the search filters. They can then add restaurants to the group's shared list by pressing the '+' button on the left of each search result.

Although users vote on restaurants using a 4-point system, Chew does not tell the group which restaurant 'won' or is the most favorable among the group. The idea behind the app is that groups can come to their own final decision after seeing all the options and the opinions of their friends.

## Motivation

Many times, be it with friends, family, or co-workers, I have found it time-consuming to choose a restaurant with a group of people. Finding one place that can accommodate everyone's dietary needs, budget, and preferences is sometimes a bit of a challenge. I wondered if maybe a simple app that allows everyone to suggest options and let others know what they liked would help streamline the process and pick a restaurant that everyone loves. When I dreamt up what my solution might look like, I had these goals:

1. Give users an easy way to see the restaurant options and share their opinion. The app shouldn't have some highly-contrived voting mechanism to pick a restaurant for the group; seeing a list of options all together will help people come to a conclusion on their own.
2. The app should be easy to access for all people. Minimal and quick authentication is a must, as well as a platform-agnostic app, which doesn't rely on everyone using the same social network or messaging service.
3. A search feature that allows users to find new restaurants by searching for keywords and some optional search filters.

## **Solution**

![Chew architecture](./assets/project-images/chew_architecture.png)

The client side of the app is a mobile-first web app built with React. The React app connects to a Node.js server running express via Socket.io and HTTP connections. Socket.io is used to push updates to the client, such as when a new restaurant is added to the list or when someone votes on a restaurant. Using Socket.io, the client can subscribe to particular events instead of manually checking for changes at a certain time interval. Users can see changes as they happen without refreshing the page. The client sends HTTP POST requests to the server when the user adds a new restaurant or votes on a restaurant.

All data is saved using Firebase Realtime Database. When the server is active, all data from a particular session is cached on the server, so requests from the client can all be handled without retrieving data from Firebase. After a period of inactivity, the server goes to sleep and locally saved data is lost. If a request is made to the server in this state, it first refreshes the local cache using Firebase before proceeding.

Search requests are sent from the client to the server and then handled using the business search endpoint of the Yelp Fusion API. Search filters that the API supports, such as price range, and sent to the endpoint, and other filters which are not supported, such as Services Offered, are filtered on the server after the response is recieved.

## Lessons Learned

When I began this project, I immediately turned to Firebase for data storage because that was what I was comfortable and familiar with. As I learned more about different database paradigms, I realized that a non-relational database is not the best choice for an app like this, which implements many CRUD operations. Firebase also has the frustrating feature of not allowing for null data in the tree, making the logic of updating a node a bit more complicated. Additionally, Chew doesn't even take advantage of the really cool features of Firebase, like subscribing to events occurring at a particular node! This made me realize that SQL and database architecture are skills I really need to learn for future work.
