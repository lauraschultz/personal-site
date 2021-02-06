<script>
	import Divider3 from "../../shared/dividers/Divider3.svelte";
</script>

<section class="section bg-blue-900 text-gray-50" id="contact">
	<Divider3 color="text-gray-100" />
	<div class="section-container">
		<h2 class="section-header">Contact</h2>
		<div class="max-w-md mx-auto">
			<!-- <div class="flex items-center justify-center"> -->
			<!-- <img
				class="flex-initial w-36 sm:w-44 md:w-60 lg:w-80 max-w-screen rounded-md shadow-lg my-8"
				src="./assets/laura.jpg"
				alt="Laura"
			/> -->
			<!-- <div class="flex-initial max-w-md"> -->
			<a
				href="https://www.linkedin.com/in/lauraschultz/"
				target="_blank"
				class="flex justify-start items-center my-8"
				><span
					class="flex-initial flex items-center w-12 h-12 -mr-4 bg-blue-500 rounded-full justify-center text-xl shadow z-20"
					><div><i class="fab fa-linkedin" /></div></span
				><span class="flex-initial border-b-4 border-gray-300 z-10"
					><span class="ml-6 mr-2">lauraschultz</span></span
				>
			</a>
			<a
				href="mailto:schultzlaurac@gmail.com"
				target="_blank"
				class="flex justify-start items-center my-8"
				><span
					class="flex-initial flex items-center w-12 h-12 -mr-4 bg-blue-500 rounded-full justify-center text-xl shadow z-20"
					><div><i class="fas fa-envelope" /></div></span
				><span class="flex-initial select-all border-b-4 border-gray-300 z-10"
					><span class="ml-6 mr-2">schultzlaurac@gmail.com</span></span
				>
			</a>
			<!-- </div> -->
			<!-- </div> -->

			<p class="pt-3 italic text-sm leading-tight">
				Or, send me a message using the form below and I will respond to you
				soon:
			</p>
			<form name="contact" method="POST" class="">
				<div
					class="px-4 py-2 rounded shadow bg-gray-100 text-gray-600 focus-within:ring focus-within:border-gray-300 my-4 relative"
				>
					<i
						class="fas fa-pencil-alt absolute top-0 left-0 -ml-10 my-4 text-gray-100"
						data-fa-transform="grow-8 flip-h"
					/>
					<input type="hidden" name="form-name" value="contact" />
					<input
						name="subject"
						type="text"
						class="my-2 focus:outline-none block w-full bg-gray-100 font-bold"
						placeholder="Subject"
					/>
					<hr />
					<textarea
						name="message"
						class="my-2 focus:outline-none block w-full bg-gray-100"
						rows="6"
						placeholder="Message"
					/></div
				>

				<div class="relative my-4">
					<i
						class="fas fa-at absolute top-0 left-0 -ml-10 my-5 text-gray-100"
						data-fa-transform="grow-8"
					/>

					<input
						name="email"
						type="email"
						class="p-4 rounded shadow bg-gray-100 text-gray-600 block w-full focus:outline-none focus:ring focus:border-gray-300"
						placeholder="Email"
					/></div
				>
				<button
					type="submit"
					class="group text-lg font-bold flex-inital hover:pr-4 transition-spacing duration-300 bg-blue-500 text-gray-100 px-5 py-1.5 rounded-lg shadow-lg"
					href="http://github.com/lauraschultz"
					target="_blank"
				>
					Submit
					<i
						class="fas fa-paper-plane ml-1 group-hover:ml-2 group-hover:pb-1 transition-spacing duration-300"
					/>
				</button>
			</form>
		</div>
	</div>
</section>
