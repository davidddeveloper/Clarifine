document.addEventListener("DOMContentLoaded", () => {
    // Theme toggle functionality
    const themeToggle = document.querySelector(".theme-toggle")
    const body = document.body
  
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      body.classList.add("dark-theme")
    }
  
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-theme")
  
      // Save theme preference
      if (body.classList.contains("dark-theme")) {
        localStorage.setItem("theme", "dark")
      } else {
        localStorage.setItem("theme", "light")
      }
    })
  
    // FAQ accordion functionality
    const accordionItems = document.querySelectorAll(".accordion-item")
  
    accordionItems.forEach((item) => {
      const header = item.querySelector(".accordion-header")
  
      header.addEventListener("click", () => {
        // Close all other items
        accordionItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove("active")
          }
        })
  
        // Toggle current item
        item.classList.toggle("active")
      })
    })
  })
  
  