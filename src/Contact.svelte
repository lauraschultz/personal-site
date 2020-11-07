<script>
  import { library, dom } from "@fortawesome/fontawesome-svg-core";
  import { faPaperPlane } from "@fortawesome/free-solid-svg-icons/faPaperPlane";
  import { faEnvelope } from "@fortawesome/free-solid-svg-icons/faEnvelope";
  import { faLinkedin } from "@fortawesome/free-brands-svg-icons/faLinkedin";
  library.add(faLinkedin)
  library.add(faPaperPlane)
  library.add(faEnvelope)
  dom.watch();
</script>

<section class="section bg-blue-900 text-light" id="contact">
  <div class="section-container">
    <h2 class="section-header">Contact</h2>
    <div class="flex flex-wrap justify-around bg-texture p-4 rounded-sm">
      <a href="https://www.linkedin.com/in/lauraschultz/" target="_blank"
        class="w-full sm:w-auto flex-initial flex items-center"><i
          class="fab fa-linkedin fa-2x mr-2"></i><span>lauraschultz</span>
      </a>
      <a href="mailto:schultzlaurac@gmail.com" class="w-full sm:w-auto flex-initial flex items-center"><i
          class="fas fa-envelope fa-2x mr-2"></i><span>schultzlaurac@gmail.com</span>
      </a>
    </div>
    <p class="pt-3 sm:px-4 md:px-10 lg:px-16">Or, send me a message using the form below and I will respond to you soon:
    </p>
    <form name="contact-form" method="POST" class="mx-auto w-max-content py-2" netlify data-netlify="true">
      <label class="block py-1 w-max-content">
        <div class="inline-block w-24">
          Subject:
        </div>

        <input name="subject" type="text" class="w-48 sm:w-64 text-gray-800 px-2 py-1 rounded bg-gray-200" />
      </label>
      <label class="block py-1 w-max-content">
        <div class="inline-block w-24 align-top">
          Message:
        </div>
        <textarea name="message" class="w-48 sm:w-64 text-gray-800 px-2 py-1 rounded bg-gray-200" rows="5" />
        </label>
      <label class="block py-1 w-max-content">
        <div class="inline-block w-24">
          Your email:
        </div>
        <input name="email" type="email" class="w-48 sm:w-64 text-gray-800 px-2 py-1 rounded bg-gray-200"/>
      </label>
      <button type="submit" class="group rounded-full bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-700 hover:to-blue-600 py-1 px-5 hover:pr-2 uppercase tracking-wide ml-24 mt-2 transition-spacing duration-300">
        submit
        <i class="fas fa-paper-plane ml-1 group-hover:ml-4 group-hover:pb-1 inline-block transition-spacing duration-300"></i>
      </button>
    </form>
    
  </div>

</section>