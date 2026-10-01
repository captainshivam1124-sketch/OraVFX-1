(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];

  const fullPortfolioItems = [
    {
      type: "video",
      cat: "video",
      title: "Video Editing — Selected Reel",
      label: "VIDEO EDITING",
      src: "assets/media/portfolio/videos/grouped-video-editing.mp4",
      poster: "assets/media/portfolio/posters/grouped-video-editing.jpg",
      alt: "Selected ORA VFX video editing reel",
    },
    {
      type: "video",
      cat: "motion",
      title: "Graphics / Motion Graphics — Selected Reel",
      label: "GRAPHICS / MOTION",
      src: "assets/media/portfolio/videos/grouped-motion-graphics.mp4",
      poster: "assets/media/portfolio/posters/grouped-motion-graphics.jpg",
      alt: "Selected ORA VFX graphics and motion graphics reel",
    },
    {
      type: "video",
      cat: "vfx",
      title: "VFX — Selected Reel",
      label: "VFX",
      src: "assets/media/portfolio/videos/grouped-vfx.mp4",
      poster: "assets/media/portfolio/posters/grouped-vfx.jpg",
      alt: "Selected ORA VFX visual effects reel",
    },
    {
      type: "video",
      cat: "ai",
      title: "AI Ads — Selected Reel",
      label: "AI ADS",
      src: "assets/media/portfolio/videos/grouped-ai-ads.mp4",
      poster: "assets/media/portfolio/posters/grouped-ai-ads.jpg",
      alt: "Selected ORA VFX AI advertisement reel",
    },
    {
      type: "video",
      cat: "social",
      title: "Social Content — Selected Reel",
      label: "SOCIAL CONTENT",
      src: "assets/media/portfolio/videos/grouped-social-content.mp4",
      poster: "assets/media/portfolio/posters/grouped-social-content.jpg",
      alt: "Selected ORA VFX social content reel",
    },
    {
      type: "image",
      cat: "3d",
      title: "3D Visualization — Selected Work",
      label: "3D",
      src: "assets/media/portfolio/images/15.webp",
      alt: "3D interior and modern bedroom visualization",
    },
    

    {
      type: "video",
      cat: "video",
      title: "Podcast — Edited Video",
      label: "VIDEO EDITING",
      src: "assets/media/portfolio/videos/Podcast.mp4",
      poster: "assets/media/portfolio/posters/03-09-2026.jpg",
      alt: "Edited video sample dated September 3, 2026",
    },
    
    {
      type: "video",
      cat: "video",
      title: "3D product Animation",
      label: "3D product Animation",
      src: "assets/media/portfolio/videos/3d.mp4",
      poster: "assets/media/portfolio/posters/3d.png",
      alt: "3D sneaker product Animation",
    },

    {
      type: "video",
      cat: "video",
      title: "BTS Editing — Edit Process",
      label: "VIDEO EDITING",
      src: "assets/media/portfolio/videos/bts-editing.mp4",
      poster: "assets/media/portfolio/posters/bts-editing.jpg",
      alt: "Behind the scenes video editing sample",
    },
    {
      type: "video",
      cat: "video",
      title: "Sandeep Maheshwari — Video Edit",
      label: "VIDEO EDITING",
      src: "assets/media/portfolio/videos/sandeep-maheshwari.mp4",
      poster: "assets/media/portfolio/posters/sandeep-maheshwari.jpg",
      alt: "Sandeep Maheshwari video editing sample",
    },

    {
      type: "video",
      cat: "motion",
      title: "Business Motion Graphics",
      label: "MOTION GRAPHICS",
      src: "assets/media/portfolio/videos/business-motion-graphics.mp4",
      poster: "assets/media/portfolio/posters/business-motion-graphics.jpg",
      alt: "Business motion graphics video sample",
    },
    {
      type: "video",
      cat: "motion",
      title: "Infographics Motion Design",
      label: "MOTION GRAPHICS",
      src: "assets/media/portfolio/videos/infographics.mp4",
      poster: "assets/media/portfolio/posters/infographics.jpg",
      alt: "Infographics motion design video sample",
    },
    {
      type: "video",
      cat: "motion",
      title: "Motion Graphics Ads 02",
      label: "MOTION GRAPHICS",
      src: "assets/media/portfolio/videos/motion-graphics-ads-02.mp4",
      poster: "assets/media/portfolio/posters/motion-graphics-ads-02.jpg",
      alt: "Motion graphics advertising sample",
    },
    {
      type: "video",
      cat: "motion",
      title: "Motion Graphics",
      label: "MOTION GRAPHICS",
      src: "assets/media/portfolio/videos/motion-graphics.mp4",
      poster: "assets/media/portfolio/posters/motion-graphics.jpg",
      alt: "Motion graphics work sample",
    },
    {
      type: "video",
      cat: "motion",
      title: "SFX Motion Graphics",
      label: "MOTION GRAPHICS",
      src: "assets/media/portfolio/videos/sfx-motion-graphics.mp4",
      poster: "assets/media/portfolio/posters/sfx-motion-graphics.jpg",
      alt: "SFX and motion graphics work sample",
    },

    {
      type: "video",
      cat: "ai",
      title: "AI Motion Graphics",
      label: "AI ADS",
      src: "assets/media/portfolio/videos/ai-motion-graphics.mp4",
      poster: "assets/media/portfolio/posters/ai-motion-graphics.jpg",
      alt: "AI-assisted motion graphics sample",
    },

    {
      type: "video",
      cat: "social",
      title: "MM Orthocare — Social Creative",
      label: "SOCIAL CONTENT",
      src: "assets/media/portfolio/videos/mm-orthocare.mp4",
      poster: "assets/media/portfolio/posters/mm-orthocare.jpg",
      alt: "MM Orthocare social content video sample",
    },
    {
      type: "video",
      cat: "social",
      title: "Trending Ads — Social Creative",
      label: "SOCIAL CONTENT",
      src: "assets/media/portfolio/videos/trending-ads.mp4",
      poster: "assets/media/portfolio/posters/trending-ads.jpg",
      alt: "Trending social advertisement video sample",
    },

    {
      type: "image",
      cat: "social",
      title: "Content Creator Creative",
      label: "SOCIAL CONTENT",
      src: "assets/media/portfolio/images/10.webp",
      alt: "Content creator social media creative",
    },
    {
      type: "image",
      cat: "motion",
      title: "Content Creation & Editing",
      label: "GRAPHICS / MOTION",
      src: "assets/media/portfolio/images/2.webp",
      alt: "Content creation and video editing services graphic",
    },
    {
      type: "image",
      cat: "motion",
      title: "Professional Video Editing",
      label: "GRAPHICS / MOTION",
      src: "assets/media/portfolio/images/11.webp",
      alt: "Professional video editing service graphic",
    },
    {
      type: "image",
      cat: "motion",
      title: "Video Editing Service Graphic",
      label: "GRAPHICS / MOTION",
      src: "assets/media/portfolio/images/12.webp",
      alt: "Video editing service graphic",
    },
    {
      type: "image",
      cat: "motion",
      title: "Video Editing Studio Creative",
      label: "GRAPHICS / MOTION",
      src: "assets/media/portfolio/images/13.webp",
      alt: "Video editing studio promotional graphic",
    },
    {
      type: "image",
      cat: "motion",
      title: "Creative Visual Production",
      label: "GRAPHICS / MOTION",
      src: "assets/media/portfolio/images/14.webp",
      alt: "Creative visual production graphic",
    },
    {
      type: "image",
      cat: "motion",
      title: "Creative Marketing Agency",
      label: "GRAPHICS / MOTION",
      src: "assets/media/portfolio/images/16.webp",
      alt: "Creative marketing agency graphic",
    },
    {
      type: "image",
      cat: "motion",
      title: "Creative Visual Production",
      label: "GRAPHICS / MOTION",
      src: "assets/media/portfolio/images/22.webp",
      alt: "Creative visual production social graphic",
    },
    {
      type: "image",
      cat: "motion",
      title: "Video Editing Services",
      label: "GRAPHICS / MOTION",
      src: "assets/media/portfolio/images/4.webp",
      alt: "Video editing services promotional graphic",
    },
    {
      type: "image",
      cat: "motion",
      title: "Content Creation & Editing",
      label: "GRAPHICS / MOTION",
      src: "assets/media/portfolio/images/5.webp",
      alt: "Content creation and editing services graphic",
    },
    {
      type: "image",
      cat: "motion",
      title: "Creative Visual Production",
      label: "GRAPHICS / MOTION",
      src: "assets/media/portfolio/images/7.webp",
      alt: "Creative visual production graphic",
    },
    {
      type: "image",
      cat: "social",
      title: "Hiring Creative",
      label: "SOCIAL CONTENT",
      src: "assets/media/portfolio/images/Hiring poster.webp",
      alt: "ORA VFX hiring promotional creative",
    },
    {
      type: "image",
      cat: "social",
      title: "Durga Puja Creative",
      label: "SOCIAL CONTENT",
      src: "assets/media/portfolio/images/ORA VFX Durga Puja 2026 Poster 2.webp",
      alt: "ORA VFX Durga Puja 2026 promotional creative",
    },
    {
      type: "image",
      cat: "social",
      title: "Video Editing Offer",
      label: "SOCIAL CONTENT",
      src: "assets/media/portfolio/images/Offer poster.webp",
      alt: "Video editing offer promotional creative",
    },
    {
      type: "image",
      cat: "social",
      title: "Informative Creative",
      label: "SOCIAL CONTENT",
      src: "assets/media/portfolio/images/informative poster.webp",
      alt: "Informative social media creative",
    },
  ];

  const categoryNames = {
    video: "Video Editing",
    motion: "Graphics / Motion Graphics",
    vfx: "VFX",
    ai: "AI Ads",
    social: "Social Content",
    "3d": "3D",
  };

  function renderFullPortfolio() {
    const grid = $("#fullPortfolioGrid");
    if (!grid) return;

    const fragment = document.createDocumentFragment();
    fullPortfolioItems.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "work reveal";
      card.dataset.cat = item.cat;
      card.dataset.fullPortfolioItem = "";

      const art = document.createElement("div");
      art.className = "work-art media-art";

      let media;
      if (item.type === "video") {
        media = document.createElement("video");
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.preload = "none";
        media.dataset.poster = item.poster;
        media.dataset.autoplay = "";
        media.setAttribute("aria-label", item.alt);
        const source = document.createElement("source");
        source.src = item.src;
        source.type = "video/mp4";
        media.appendChild(source);
      } else {
        media = document.createElement("img");
        media.src = item.src;
        media.alt = item.alt;
        media.loading = "lazy";
        media.decoding = "async";
        media.width = 1080;
        media.height = 1350;
      }

      art.appendChild(media);
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      art.appendChild(number);
      const label = document.createElement("strong");
      label.textContent = item.label;
      art.appendChild(label);

      const title = document.createElement("h3");
      title.textContent = item.title;
      const category = document.createElement("p");
      category.textContent = categoryNames[item.cat] || item.cat;
      card.append(art, title, category);
      fragment.appendChild(card);
    });
    grid.replaceChildren(fragment);
  }

  function createLightbox() {
    if ($("#oraLightbox")) return $("#oraLightbox");
    const lightbox = document.createElement("div");
    lightbox.id = "oraLightbox";
    lightbox.className = "ora-lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
      <button class="ora-lightbox-close" type="button" aria-label="Close preview">×</button>
      <button class="ora-lightbox-nav ora-lightbox-prev" type="button" aria-label="Previous portfolio item">‹</button>
      <div class="ora-lightbox-panel" role="dialog" aria-modal="true" aria-labelledby="oraLightboxTitle">
        <div class="ora-lightbox-media-wrap"></div>
        <div class="ora-lightbox-caption">
          <span class="ora-lightbox-category"></span>
          <strong id="oraLightboxTitle"></strong>
        </div>
      </div>
      <button class="ora-lightbox-nav ora-lightbox-next" type="button" aria-label="Next portfolio item">›</button>
    `;
    document.body.appendChild(lightbox);
    return lightbox;
  }

  function setupLightbox() {
    const lightbox = createLightbox();
    const mediaWrap = $(".ora-lightbox-media-wrap", lightbox);
    const closeButton = $(".ora-lightbox-close", lightbox);
    const prevButton = $(".ora-lightbox-prev", lightbox);
    const nextButton = $(".ora-lightbox-next", lightbox);
    const titleNode = $("#oraLightboxTitle", lightbox);
    const categoryNode = $(".ora-lightbox-category", lightbox);
    let items = [];
    let index = -1;
    let lastFocused = null;
    let closeTimer = 0;

    const visibleCards = () =>
      $$(".work", document).filter((card) => {
        if (
          card.dataset.fullPortfolioItem !== undefined &&
          card.closest("#fullPortfolioGrid")
        )
          return !card.classList.contains("is-hidden");
        return !card.classList.contains("is-hidden");
      });

    const cardInfo = (card) => {
      const video = $("video", card);
      const image = $("img", card);
      const title = $("h3", card)?.textContent.trim() || "ORA VFX Portfolio";
      const category = $("p", card)?.textContent.trim() || "";
      if (video) {
        const source = $("source", video);
        return {
          type: "video",
          src: source?.src || video.currentSrc || video.src,
          poster: video.dataset.poster || video.getAttribute("poster") || "",
          title,
          category,
          alt: video.getAttribute("aria-label") || title,
        };
      }
      if (image) {
        return {
          type: "image",
          src: image.currentSrc || image.src,
          title,
          category,
          alt: image.alt || title,
        };
      }
      return null;
    };

    const stopCurrentMedia = () => {
      const current = $("video", mediaWrap);
      if (!current) return;
      current.pause();
      current.removeAttribute("src");
      current.load();
    };

    const render = () => {
      if (!items[index]) return;
      stopCurrentMedia();
      mediaWrap.replaceChildren();
      const item = items[index];
      let media;
      if (item.type === "video") {
        media = document.createElement("video");
        media.controls = true;
        media.autoplay = true;
        media.muted = false;
        media.defaultMuted = false;
        media.volume = 1;
        media.playsInline = true;
        media.preload = "auto";
        media.setAttribute("aria-label", item.alt);
        if (item.poster) media.poster = item.poster;
        media.src = item.src;
      } else {
        media = document.createElement("img");
        media.src = item.src;
        media.alt = item.alt;
        media.decoding = "async";
      }
      media.className = "ora-lightbox-media";
      mediaWrap.appendChild(media);
      titleNode.textContent = item.title;
      categoryNode.textContent = item.category;
      prevButton.disabled = index <= 0;
      nextButton.disabled = index >= items.length - 1;
      if (item.type === "video") media.play().catch(() => {});
    };

    const open = (card) => {
      window.clearTimeout(closeTimer);
      const cards = visibleCards();
      const cardIndex = cards.indexOf(card);
      if (cardIndex < 0) return;
      const infoItems = cards.map(cardInfo).filter(Boolean);
      const infoIndex = cards
        .slice(0, cardIndex)
        .map(cardInfo)
        .filter(Boolean).length;
      if (!infoItems.length) return;
      items = infoItems;
      index = infoIndex;
      lastFocused = document.activeElement;
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("ora-lightbox-open");
      requestAnimationFrame(() => lightbox.classList.add("is-open"));
      render();
      closeButton.focus();
    };

    const close = () => {
      if (lightbox.hidden) return;
      lightbox.classList.remove("is-open");
      stopCurrentMedia();
      document.body.classList.remove("ora-lightbox-open");
      closeTimer = window.setTimeout(() => {
        lightbox.hidden = true;
        lightbox.setAttribute("aria-hidden", "true");
        mediaWrap.replaceChildren();
      }, 220);
      lastFocused?.focus?.();
    };

    const move = (delta) => {
      if (lightbox.hidden) return;
      const nextIndex = index + delta;
      if (nextIndex < 0 || nextIndex >= items.length) return;
      index = nextIndex;
      render();
    };

    document.addEventListener("click", (event) => {
      const card = event.target.closest(".work");
      if (!card || !card.querySelector("video, img")) return;
      if (event.target.closest("a, button")) return;
      event.preventDefault();
      open(card);
    });
    closeButton.addEventListener("click", close);
    prevButton.addEventListener("click", () => move(-1));
    nextButton.addEventListener("click", () => move(1));
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) close();
    });
    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
    });
  }

  renderFullPortfolio();
  setupLightbox();
})();
