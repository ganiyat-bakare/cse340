// Prevents "Update" button from executing unless some data has changed.
const form = document.querySelector("#updateAccount")
    form.addEventListener("change", function () {
      const updateBtn = document.querySelector("button")
      updateBtn.removeAttribute("disabled")
    })