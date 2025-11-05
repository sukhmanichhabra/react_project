// PAGINATION

document.addEventListener("DOMContentLoaded", function () {
    const pages = document.querySelectorAll(".pagination .page");
    const prev = document.querySelector(".pagination .prev");
    const next = document.querySelector(".pagination .next");

    let currentPage = new URLSearchParams(window.location.search).get("page") || "1";

    function updatePagination(newPage) {
        window.location.href = `?page=${newPage}`;
    }

    function setActivePage() {
        pages.forEach(page => {
            page.classList.remove("active");
            if (page.dataset.page === currentPage) {
                page.classList.add("active");
            }
        });
    }

    pages.forEach(page => {
        page.dataset.page = page.textContent;
        page.addEventListener("click", function (e) {
            e.preventDefault();
            updatePagination(this.dataset.page);
        });
    });

    prev.addEventListener("click", function (e) {
        e.preventDefault();
        if (currentPage > 1) {
            updatePagination(Number(currentPage) - 1);
        }
    });

    next.addEventListener("click", function (e) {
        e.preventDefault();
        if (currentPage < pages.length) {
            updatePagination(Number(currentPage) + 1);
        }
    });

    setActivePage();
});

  const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImg');

  thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', function() {
          mainImage.src = this.src.replace('100x80', '600x400');
      });
  });

  function toggleDropdown(header) {
    let drop = header.parentElement;
    let content = drop.querySelector('.drop-content');
    let icon = drop.querySelector('.drop-icon');

    if (drop.classList.contains('open')) {
        content.style.maxHeight = null;
        content.style.padding = "0 10px";
        drop.classList.remove('open');
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
        content.style.padding = "10px";
        drop.classList.add('open');
    }
}


