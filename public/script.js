  const shortenBtn = document.querySelector(".shorten-btn");
      const UrlInput = document.querySelector("#url");
      const alert = document.querySelector(".alert");
      const clearBtn = document.querySelector(".clear-btn");

      if (UrlInput.value.length > 0) {
        clearBtn.style.display = "block";
      }
      clearBtn.addEventListener("click", () => {
        UrlInput.value = "";
      });

      //

      //

      shortenBtn.addEventListener("click", () => {
        if (UrlInput.value === "") {
          alert.style.display = "block";
        } else {
          alert.style.display = "none";
        }
      });

      const fetchLinks = async () => {
        try {
          const res = await fetch("/links");
          const links = await res.json();
          console.log(links);

          const container = document.querySelector(".links");
          container.innerHTML = "";

          for (const [shortCode, url] of Object.entries(links)) {
            const div = document.createElement("div");
            div.className = "link";

            div.innerHTML = `
        <p class="input-link">${
          url.length > 30 ? url.slice(0, 30) + "......" : url
        }</p>
        <p class="shorten-link">
          <a href="/${shortCode}" target="_blank">${
              window.location.origin
            }/${shortCode}</a>
          <span class="copy-btn" data-link="${
            window.location.origin
          }/${shortCode}">Copy</span>
          <span class="remove-btn" data-link="${
            window.location.origin
          }/${shortCode}">Remove</span>
        </p>
      `;

            container.prepend(div);
          }

          document.querySelectorAll(".copy-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const link = btn.getAttribute("data-link");
              navigator.clipboard.writeText(link);
              btn.textContent = "Copied!";
              setTimeout(() => (btn.textContent = "Copy"), 1500);
            });
          });
        } catch (err) {
          console.error("Error fetching links:", err);
        }

        document.querySelectorAll(".remove-btn").forEach((btn) => {
          btn.addEventListener("click", async () => {
            console.log("click");
            const shortLink = btn.getAttribute("data-link"); // e.g. http://localhost:3000/abc123
            const shortCode = shortLink.split("/").pop(); // extract 'abc123'

            const confrimDelete = confirm("❌Are you sure you want to delete this link?");
            if(!confrimDelete) return ;

            try {
              const res = await fetch(`/links/${shortCode}`, {
                method: "DELETE",
              });

              if (res.ok) {
                btn.closest(".link").remove(); // remove from DOM
              } else {
                console.error("Failed to delete:", shortCode);
              }
            } catch (err) {
              console.error("Error deleting link:", err);
            }
          });
        });
      };

      fetchLinks();