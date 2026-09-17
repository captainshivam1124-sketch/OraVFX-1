      // =========================================================
      // LOADER
      // =========================================================
      (function loader() {
        const loaderEl = document.querySelector(".loader");
        const progressBar = loaderEl.querySelector(".loader-line span");
        const numberEl = loaderEl.querySelector(".loader-number");
        let progress = 0;
        const startTime = performance.now();
        let appStarted = false;

        // Keep the cinematic loader, but never make it an artificial 1–2s delay.
        const interval = setInterval(() => {
          progress = Math.min(100, progress + 18);
          numberEl.textContent = Math.floor(progress)
            .toString()
            .padStart(2, "0");
          progressBar.style.width = progress + "%";

          if (!appStarted && progress >= 54) {
            appStarted = true;
            initApp();
          }

          if (progress >= 100) {
            clearInterval(interval);
            const elapsed = performance.now() - startTime;
            const revealDelay = Math.max(0, 420 - elapsed);

            setTimeout(() => {
              loaderEl.classList.add("is-hidden");
              document.body.classList.remove("is-loading");
              document.body.classList.add("is-loaded");

              if (!appStarted) {
                appStarted = true;
                initApp();
              }
            }, revealDelay);
          }
        }, 70);
      })();

      // =========================================================
      // APP INIT
      // =========================================================
      function initApp() {
        loadPackages();

        const statementVideo = document.querySelector(".statement-logo");
        if (statementVideo && "IntersectionObserver" in window) {
          const statementVideoObserver = new IntersectionObserver(
            (entries, observer) => {
              if (!entries.some((entry) => entry.isIntersecting)) return;
              statementVideo.preload = "auto";
              statementVideo.load();
              statementVideo.play().catch(() => {});
              observer.disconnect();
            },
            { rootMargin: "300px 0px" },
          );
          statementVideoObserver.observe(statementVideo);
        }

        // Lenis smooth scroll
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          smoothWheel: true,
        });

        lenis.on("scroll", ScrollTrigger.update);

        // Connect Lenis to GSAP ScrollTrigger
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        // Register ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // =========================================================
        // HERO WEBGL — PREMIUM ABSTRACT VFX OBJECT
        // =========================================================
        const heroCanvas = document.querySelector(".hero-webgl");
        const heroMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

        if (heroCanvas && window.THREE) {
          const isMobile = window.innerWidth <= 768;
          const renderer = new THREE.WebGLRenderer({
            canvas: heroCanvas,
            alpha: true,
            antialias: !isMobile,
            powerPreference: "high-performance",
          });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.25));
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.05;

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
          camera.position.set(0, 0, isMobile ? 9.5 : 8.4);

          const root = new THREE.Group();
          root.position.set(
            isMobile ? 0.55 : 1.9,
            isMobile ? 0.15 : 0.05,
            0
          );
          root.rotation.set(0.08, -0.2, 0.14);
          scene.add(root);

          const geometry = new THREE.TorusKnotGeometry(
            2.0,
            0.54,
            isMobile ? 72 : 120,
            isMobile ? 12 : 18,
            2,
            3
          );

          const material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0x11161c),
            metalness: 0.72,
            roughness: 0.2,
            transmission: 0.12,
            thickness: 1.0,
            clearcoat: 1,
            clearcoatRoughness: 0.12,
            reflectivity: 1.0,
          });

          const object = new THREE.Mesh(
            geometry,
            material
          );

          object.scale.setScalar(
             isMobile ? 0.70 : 0.85
          );

          root.add(object);

          const innerGeometry = new THREE.TorusKnotGeometry(
            2.12,
            0.12,
            isMobile ? 56 : 88,
            10,
            2,
            3
          );

          const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0.60,
            blending: THREE.AdditiveBlending,
          });

          const innerGlow = new THREE.Mesh(
            innerGeometry,
            innerMaterial
          );

          innerGlow.scale.setScalar(
            isMobile ? 0.70 : 0.85
          );

          root.add(innerGlow);

          const ambient = new THREE.HemisphereLight(
            0xcfefff,
            0x313131,
            2.2
          );

          scene.add(ambient);

          const key = new THREE.PointLight(
            0xffffff,
            18,
            18,
            2
          );

          key.position.set(4, 4, 6);
          scene.add(key);

          const rim = new THREE.PointLight(
            0x00e5ff,
            14,
            14,
            2
          );

          rim.position.set(-5, -1, 3);
          scene.add(rim);

          const resizeHero = () => {
            const width =
              heroCanvas.clientWidth ||
              window.innerWidth;

            const height =
              heroCanvas.clientHeight ||
              window.innerHeight;

            renderer.setSize(
              width,
              height,
              false
            );

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
          };

          resizeHero();

          window.addEventListener(
            "resize",
            resizeHero
          );

          let pointerX = 0;
          let pointerY = 0;

          if (
            !isMobile &&
            !heroMotionQuery.matches
          ) {
            window.addEventListener(
              "pointermove",
              (event) => {
                pointerX =
                  (event.clientX /
                    window.innerWidth -
                    0.5) *
                  2;

                pointerY =
                  (event.clientY /
                    window.innerHeight -
                    0.5) *
                  2;
              },
              { passive: true }
            );
          }

          const render = (time) => {
            const t = time * 0.00045;

            if (!heroMotionQuery.matches) {
              root.rotation.y =
                -0.2 +
                t * 0.25 +
                pointerX * 0.12;

              root.rotation.x =
                0.08 +
                Math.sin(t * 1.4) * 0.08 -
                pointerY * 0.06;

              root.rotation.z =
                0.14 +
                Math.sin(t * 0.8) * 0.035;

              root.position.y =
                Math.sin(t * 0.7) * 0.16;

              key.position.x =
                4 + pointerX * 1.4;

              key.position.y =
                4 - pointerY * 1.0;

              rim.position.x =
                -5 - pointerX * 1.2;
            }

            renderer.render(
              scene,
              camera
            );
          };

          let heroIsVisible = true;
          let lastFrameTime = 0;
          const targetFrameMs = isMobile ? 33 : 24; // ~30fps mobile / ~42fps desktop

          const renderLoop = (time) => {
            if (time - lastFrameTime < targetFrameMs) return;
            lastFrameTime = time;
            render(time);
          };

          renderer.setAnimationLoop(renderLoop);

          if ("IntersectionObserver" in window) {
            const heroVisibilityObserver = new IntersectionObserver(
              ([entry]) => {
                heroIsVisible = entry.isIntersecting;
                if (heroIsVisible) {
                  lastFrameTime = 0;
                  renderer.setAnimationLoop(renderLoop);
                } else {
                  renderer.setAnimationLoop(null);
                }
              },
              { threshold: 0 }
            );
            heroVisibilityObserver.observe(heroCanvas);
          }

          heroMotionQuery.addEventListener?.(
            "change",
            () => {
              if (heroMotionQuery.matches) {
                root.rotation.set(
                  0.08,
                  -0.2,
                  0.14
                );

                root.position.y = 0;
              }
            }
          );

          gsap.to(heroCanvas, {
            yPercent: 6,
            scale: 1.06,
            ease: "none",
            scrollTrigger: {
              trigger: "#hero",
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
          });
        }

        // =========================================================
        // CUSTOM CURSOR
        // =========================================================
        const cursor = document.querySelector(".cursor");
        const dot = cursor.querySelector(".cursor-dot");
        const label = cursor.querySelector(".cursor-label");

        if (window.innerWidth > 1024) {
          document.addEventListener("mousemove", (e) => {
            gsap.to(cursor, {
              x: e.clientX,
              y: e.clientY,
              duration: 0.1,
              ease: "power1.out",
            });
          });

          const magneticElements = document.querySelectorAll(".magnetic");

          magneticElements.forEach((el) => {
            el.addEventListener("mouseenter", () => {
              cursor.classList.add("is-active");
              const text =
                el.getAttribute("data-cursor") || "";
              label.textContent = text;
            });

            el.addEventListener("mouseleave", () => {
              cursor.classList.remove("is-active");
            });
          });

          // Also handle project links and others
          document
            .querySelectorAll("[data-cursor]")
            .forEach((el) => {
              el.addEventListener("mouseenter", () => {
                cursor.classList.add("is-active");
                label.textContent =
                  el.getAttribute("data-cursor");
              });

              el.addEventListener("mouseleave", () => {
                cursor.classList.remove("is-active");
              });
            });
        }

        // =========================================================
        // SCROLL PROGRESS
        // =========================================================
        const progressBar =
          document.querySelector(".scroll-progress-bar");

        ScrollTrigger.create({
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            progressBar.style.width =
              self.progress * 100 + "%";
          },
        });

        // =========================================================
        // HEADER SCROLL EFFECT
        // =========================================================
        const header =
          document.querySelector(".site-header");

        ScrollTrigger.create({
          trigger: document.body,
          start: "top -80px",
          onUpdate: (self) => {
            if (self.progress > 0) {
              header.classList.add("is-scrolled");
            } else {
              header.classList.remove("is-scrolled");
            }
          },
        });

        // =========================================================
        // MOBILE MENU
        // =========================================================
        const menuToggle =
          document.querySelector(".menu-toggle");

        const mobileMenu =
          document.querySelector(".mobile-menu");

        const mobileLinks =
          mobileMenu.querySelectorAll(".mobile-link");

        menuToggle.addEventListener("click", () => {
          const isOpen =
            menuToggle.classList.toggle("is-open");

          mobileMenu.classList.toggle(
            "is-open"
          );

          menuToggle.setAttribute(
            "aria-expanded",
            isOpen
          );

          menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
          );

          document.body.style.overflow =
            isOpen ? "hidden" : "";
        });

        mobileLinks.forEach((link) => {
          link.addEventListener("click", () => {
            menuToggle.classList.remove(
              "is-open"
            );

            mobileMenu.classList.remove(
              "is-open"
            );

            menuToggle.setAttribute(
              "aria-expanded",
              "false"
            );

            menuToggle.setAttribute(
              "aria-label",
              "Open navigation menu"
            );

            document.body.style.overflow = "";
          });
        });

        const inquiryOverlay =
          document.querySelector(
            ".inquiry-form-overlay"
          );

        const inquiryForm =
          inquiryOverlay.querySelector(
            ".inquiry-form"
          );

        const inquiryClose =
          inquiryOverlay.querySelector(
            ".inquiry-form-close"
          );

        const inquiryBack =
          inquiryOverlay.querySelector(
            ".inquiry-form-back"
          );

        const packageCardsContainer = document.querySelector("#package-cards");
        const checkoutModal = document.querySelector("#checkout-modal");
        const checkoutForm = document.querySelector("#checkout-form");
        const checkoutClose = document.querySelector(".checkout-close");
        const checkoutStatus = document.querySelector("#checkout-status");
        const packageState = { list: [] };

        function formatCurrency(value) {
          return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(Number(value || 0));
        }

        function packagePrice(pkg) {
          return pkg.priceDisplay || (pkg.price ? formatCurrency(pkg.price) : "Price on request");
        }

        function getTierLabel(pkg) {
          return {
            "basic-reel-package": "Essential",
            "digital-presence-starter": "Signature",
            "enterprise-domination": "Elite",
          }[pkg.id] || "";
        }

        function getFeaturedTierPackages(packages) {
          const tierIds = [
            "basic-reel-package",
            "digital-presence-starter",
            "enterprise-domination",
          ];
          const tiers = tierIds
            .map((id) => packages.find((pkg) => pkg.id === id))
            .filter(Boolean);
          const rest = packages
            .filter((pkg) => !tierIds.includes(pkg.id))
            .sort((left, right) => Number(left.priceMin || left.price || 0) - Number(right.priceMin || right.price || 0));
          return [...tiers, ...rest];
        }

        function renderPackages() {
          if (!packageCardsContainer) return;
          if (!packageState.list.length) {
            packageCardsContainer.innerHTML = '<div class="package-card"><h3>Package catalog</h3><p>We will publish the full rate card here soon.</p></div>';
            return;
          }

          packageCardsContainer.innerHTML = getFeaturedTierPackages(packageState.list)
            .filter((pkg) => pkg.active !== false)
            .map((pkg) => `
              <article class="package-card ${pkg.featured ? "featured" : ""} ${getTierLabel(pkg) ? `tier-${getTierLabel(pkg).toLowerCase()}` : ""}">
                ${getTierLabel(pkg) ? `<span class="package-tier">${getTierLabel(pkg)}</span>` : ""}
                <span class="package-tag">${pkg.category || "Custom"}</span>
                <h3>${pkg.name}</h3>
                <p>${pkg.summary || pkg.description || "Creative package for your next production."}</p>
                <ul class="package-deliverables">
                  ${(pkg.deliverables || []).slice(0, 4).map((item) => `<li>${item}</li>`).join("")}
                </ul>
                <div class="package-price">
                  <strong>${packagePrice(pkg)}</strong>
                  <span>${pkg.billingType || "One-time"} • ${pkg.revisions || "As agreed"}</span>
                </div>
                <button type="button" data-package-id="${pkg.id}">${pkg.quoteOnly ? "Request Quote" : "Choose Package"}</button>
              </article>
            `)
            .join("");

          packageCardsContainer.querySelectorAll("[data-package-id]").forEach((button) => {
            button.addEventListener("click", () => {
              const pkg = packageState.list.find((item) => item.id === button.dataset.packageId);
              if (!pkg) return;
              openCheckout(pkg);
            });
          });
        }

        const openCheckout = (pkg) => {
          if (!checkoutModal || !checkoutForm) return;
          checkoutModal.classList.add("is-open");
          checkoutModal.setAttribute("aria-hidden", "false");
          checkoutForm.elements.packageId.value = pkg.id;
          checkoutStatus.textContent = `${pkg.name} • ${packagePrice(pkg)}`;
          checkoutForm.elements.paymentMode.value = pkg.quoteOnly ? "manual" : "razorpay";
          checkoutForm.elements.paymentMode.querySelector('[value="razorpay"]').hidden = Boolean(pkg.quoteOnly);
          document.body.style.overflow = "hidden";
        };

        function loadRazorpay() {
          if (window.Razorpay) return Promise.resolve();
          return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = resolve;
            script.onerror = () => reject(new Error("Razorpay Checkout could not be loaded."));
            document.head.appendChild(script);
          });
        }

        async function startRazorpayCheckout(order) {
          try {
            await loadRazorpay();
          } catch (error) {
            checkoutStatus.textContent = "Online payment is unavailable. Please choose manual invoice.";
            return;
          }

          if (!order.razorpayKeyId || !order.razorpayOrderId) {
            checkoutStatus.textContent = "Online payment is unavailable. Please choose manual invoice.";
            return;
          }
          const checkout = new window.Razorpay({
            key: order.razorpayKeyId,
            amount: order.payment.amount,
            currency: order.payment.currency,
            name: "OraVFX",
            description: order.packageName,
            order_id: order.razorpayOrderId,
            prefill: { name: order.customer.fullName, email: order.customer.email, contact: order.customer.phone },
            notes: { internalOrderId: order.id },
            handler: async (payment) => {
              checkoutStatus.textContent = "Confirming payment...";
              const verification = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  internalOrderId: order.id,
                  razorpayOrderId: payment.razorpay_order_id,
                  paymentId: payment.razorpay_payment_id,
                  signature: payment.razorpay_signature,
                }),
              });
              const result = await verification.json();
              checkoutStatus.textContent = verification.ok
                ? "Payment successful. Your package order is confirmed."
                : (result.message || "Payment verification failed. Please contact us before retrying.");
            },
            modal: {
              ondismiss: () => { checkoutStatus.textContent = "Payment pending. You can close this window and retry when ready."; },
            },
          });
          checkout.on("payment.failed", async (failure) => {
            checkoutStatus.textContent = "Payment failed. No charge was confirmed. You can retry or choose manual invoice.";
            await fetch("/api/payments/failed", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ internalOrderId: order.id, razorpayOrderId: order.razorpayOrderId, reason: failure.error?.description }),
            });
          });
          checkout.open();
        }

        const closeCheckout = () => {
          if (!checkoutModal) return;
          checkoutModal.classList.remove("is-open");
          checkoutModal.setAttribute("aria-hidden", "true");
          checkoutStatus.textContent = "";
          document.body.style.overflow = "";
          checkoutForm.reset();
        };

        if (checkoutClose) {
          checkoutClose.addEventListener("click", closeCheckout);
        }

        if (checkoutModal) {
          checkoutModal.addEventListener("click", (event) => {
            if (event.target === checkoutModal) closeCheckout();
          });
        }

        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && checkoutModal && checkoutModal.classList.contains("is-open")) {
            closeCheckout();
          }
        });

        async function loadPackages() {
          try {
            const packageEndpoint = window.location.port === "5500"
              ? "../data/packages.json"
              : "/api/packages";
            const response = await fetch(packageEndpoint);
            if (!response.ok) throw new Error(`Package API returned ${response.status}.`);
            const data = await response.json();
            packageState.list = Array.isArray(data)
              ? data
              : (Array.isArray(data.packages) ? data.packages : []);
            renderPackages();
          } catch (error) {
            try {
              const fallbackResponse = await fetch("../data/packages.json");
              if (!fallbackResponse.ok) throw new Error(`Package file returned ${fallbackResponse.status}.`);
              const fallbackPackages = await fallbackResponse.json();
              packageState.list = Array.isArray(fallbackPackages) ? fallbackPackages : [];
            } catch (fallbackError) {
              console.error("Failed to load package catalog.", fallbackError);
              packageState.list = [];
            }
            renderPackages();
          }
        }

        if (checkoutForm) {
          checkoutForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(checkoutForm);
            const fullName = String(formData.get("fullName") || "").trim();
            const email = String(formData.get("email") || "").trim();
            const phone = String(formData.get("phone") || "").trim();
            const packageId = String(formData.get("packageId") || "").trim();

            if (!fullName || !email || !phone || !packageId) {
              checkoutStatus.textContent = "Please complete name, email, phone, and package details.";
              return;
            }

            checkoutStatus.textContent = "Creating secure checkout...";

            try {
              const response = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                packageId,
                paymentMode: String(formData.get("paymentMode") || "manual"),
                customer: {
                  fullName,
                  email,
                  phone,
                  company: String(formData.get("company") || "").trim(),
                  notes: String(formData.get("notes") || "").trim(),
                },
              }),
            });

              const result = await response.json();
              if (!response.ok) {
                checkoutStatus.textContent = result.message || "Unable to place the order.";
                return;
              }

              if (result.order.paymentMode === "razorpay") {
                checkoutStatus.textContent = "Secure payment window ready...";
                startRazorpayCheckout(result.order);
              } else {
                checkoutStatus.textContent = "Order placed successfully. We will contact you to finalise the brief and payment steps.";
                window.setTimeout(() => { closeCheckout(); }, 1800);
              }
            } catch (error) {
              checkoutStatus.textContent = "Unable to connect to the order server. Please try again.";
            }
          });
        }

        let inquiryLastFocused = null;

        const inquiryChoices = {
          budget: "",
          timeline: "",
        };

        const closeInquiry = () => {
          inquiryOverlay.classList.remove(
            "is-open"
          );

          inquiryOverlay.setAttribute(
            "aria-hidden",
            "true"
          );

          document.body.style.overflow = "";

          lenis.start();

          if (inquiryLastFocused) {
            inquiryLastFocused.focus();
          }
        };

        const openInquiry = (event) => {
          event.preventDefault();

          inquiryLastFocused =
            document.activeElement;

          inquiryOverlay.classList.add(
            "is-open"
          );

          inquiryOverlay.setAttribute(
            "aria-hidden",
            "false"
          );

          document.body.style.overflow =
            "hidden";

          lenis.stop();

          requestAnimationFrame(() =>
            inquiryClose.focus()
          );
        };

        document
          .querySelectorAll(".nav-contact")
          .forEach((link) => {
            link.addEventListener(
              "click",
              openInquiry
            );
          });

        inquiryClose.addEventListener(
          "click",
          closeInquiry
        );

        inquiryBack.addEventListener(
          "click",
          closeInquiry
        );

        inquiryOverlay.addEventListener(
          "click",
          (event) => {
            if (
              event.target === inquiryOverlay
            ) {
              closeInquiry();
            }
          }
        );

        document.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key === "Escape" &&
              inquiryOverlay.classList.contains(
                "is-open"
              )
            ) {
              closeInquiry();
            }
          }
        );

        inquiryOverlay
          .querySelectorAll(
            ".inquiry-form-option"
          )
          .forEach((option) => {
            option.addEventListener(
              "click",
              () => {
                const selected =
                  option.classList.toggle(
                    "is-selected"
                  );

                option.setAttribute(
                  "aria-pressed",
                  selected
                );
              }
            );
          });

        inquiryOverlay
          .querySelectorAll(
            ".inquiry-form-choice"
          )
          .forEach((choice) => {
            choice.addEventListener(
              "click",
              () => {
                const group =
                  choice.dataset.choiceGroup;

                inquiryChoices[group] =
                  choice.dataset.choice;

                inquiryOverlay
                  .querySelectorAll(
                    `[data-choice-group="${group}"]`
                  )
                  .forEach((item) => {
                    const selected =
                      item === choice;

                    item.classList.toggle(
                      "is-selected",
                      selected
                    );

                    item.setAttribute(
                      "aria-pressed",
                      selected
                    );
                  });
              }
            );
          });

        const inquiryFiles =
          inquiryOverlay.querySelector(
            "#inquiry-form-files"
          );

        const inquiryFileName =
          inquiryOverlay.querySelector(
            "[data-file-name]"
          );

        inquiryFiles.addEventListener(
          "change",
          () => {
            const names = [
              ...inquiryFiles.files,
            ].map((file) => file.name);

            inquiryFileName.textContent =
              names.length
                ? names.join(", ")
                : "No file selected";

            inquiryFileName.classList.toggle(
              "has-file",
              names.length > 0
            );
          }
        );

        const submitProjectInquiry =
          async ({
            fields,
            services,
            budget,
            timeline,
          }) => {
            try {
              const files = await Promise.all(
                [...inquiryFiles.files].map(
                  (file) =>
                    new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () =>
                        resolve({
                          name: file.name,
                          data: reader.result,
                        });
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    }),
                ),
              );
              const response = await fetch(
                "/api/inquiry",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body: JSON.stringify({
                    fields,
                    services,
                    budget,
                    timeline,
                    files,
                  }),
                }
              );

              const result =
                await response.json();

              return response.ok
                ? {
                    success: true,
                    message:
                      result.message,
                  }
                : {
                    success: false,
                    message:
                      result.message ||
                      "Unable to send inquiry.",
                  };
            } catch (error) {
              return {
                success: false,
                message:
                  "Unable to connect to the inquiry server. Please try again or email oravfxbusiness@gmail.com.",
              };
            }
          };

        inquiryForm.addEventListener(
          "submit",
          async (event) => {
            event.preventDefault();

            const status =
              inquiryOverlay.querySelector(
                ".inquiry-form-status"
              );

            const formData =
              new FormData(inquiryForm);

            const requiredFields = [
              "fullName",
              "email",
              "phone",
              "details",
            ];

            let isValid = true;

            inquiryOverlay
              .querySelectorAll(
                ".inquiry-form-error"
              )
              .forEach((error) => {
                error.textContent = "";
              });

            status.textContent = "";

            requiredFields.forEach(
              (fieldName) => {
                const input =
                  inquiryForm.elements[
                    fieldName
                  ];

                if (
                  !String(
                    formData.get(fieldName) ||
                      ""
                  ).trim()
                ) {
                  inquiryOverlay
                    .querySelector(
                      `[data-error-for="${fieldName}"]`
                    )
                    .textContent =
                    "This field is required.";

                  isValid = false;
                }
              }
            );

            const email = String(
              formData.get("email") || ""
            ).trim();

            if (
              email &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
              )
            ) {
              inquiryOverlay
                .querySelector(
                  '[data-error-for="email"]'
                )
                .textContent =
                "Enter a valid email address.";

              isValid = false;
            }

            const services = [
              ...inquiryOverlay.querySelectorAll(
                ".inquiry-form-option.is-selected"
              ),
            ].map(
              (option) =>
                option.dataset.service
            );

            if (!services.length) {
              inquiryOverlay
                .querySelector(
                  '[data-error-for="services"]'
                )
                .textContent =
                "Select at least one service.";

              isValid = false;
            }

            if (!isValid) {
              const firstInvalid =
                inquiryOverlay.querySelector(
                  ".inquiry-form-error:not(:empty)"
                );

              if (firstInvalid) {
                firstInvalid
                  .closest(
                    ".inquiry-form-field, .inquiry-form-section"
                  )
                  .scrollIntoView({
                    block: "center",
                  });
              }

              return;
            }

            const result =
              await submitProjectInquiry({
                fields: {
                  fullName: String(
                    formData.get(
                      "fullName"
                    ) || ""
                  ).trim(),

                  email: String(
                    formData.get(
                      "email"
                    ) || ""
                  ).trim(),

                  phone: String(
                    formData.get(
                      "phone"
                    ) || ""
                  ).trim(),

                  company: String(
                    formData.get(
                      "company"
                    ) || ""
                  ).trim(),

                  details: String(
                    formData.get(
                      "details"
                    ) || ""
                  ).trim(),

                  reference: String(
                    formData.get(
                      "reference"
                    ) || ""
                  ).trim(),
                },

                services,

                budget:
                  inquiryChoices.budget,

                timeline:
                  inquiryChoices.timeline,
              });

            if (result.success) {
              inquiryForm.style.display =
                "none";

              inquiryOverlay
                .querySelector(
                  ".inquiry-form-success"
                )
                .classList.add(
                  "is-visible"
                );

              return;
            }

            status.textContent =
              result.message;
          }
        );

        document
          .querySelectorAll(
            'a[href^="#"]'
          )
          .forEach((link) => {
            link.addEventListener(
              "click",
              (event) => {
                if (event.defaultPrevented)
                  return;

                const targetId =
                  link.getAttribute(
                    "href"
                  );

                if (
                  !targetId ||
                  targetId === "#"
                ) {
                  return;
                }

                const target =
                  document.querySelector(
                    targetId
                  );

                if (!target) return;

                event.preventDefault();

                menuToggle.classList.remove(
                  "is-open"
                );

                mobileMenu.classList.remove(
                  "is-open"
                );

                document.body.style.overflow =
                  "";

                history.pushState(
                  null,
                  "",
                  targetId
                );

                lenis.scrollTo(
                  target,
                  {
                    offset: -80,
                    duration: 1.2,
                  }
                );
              }
            );
          });

        // =========================================================
        // HERO PARALLAX
        // =========================================================
        if (window.innerWidth > 768) {
          const heroTitle =
            document.querySelector(
              ".hero-title"
            );

          if (heroTitle) {
            gsap.to(heroTitle, {
              y: "22%",
              rotationX: -8,
              scale: 0.88,
              transformOrigin:
                "center center",
              ease: "none",
              scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: 0.8,
              },
            });
          }

          gsap.utils
            .toArray(".service-item")
            .forEach(
              (
                serviceItem,
                index
              ) => {
                gsap.fromTo(
                  serviceItem,
                  {
                    y: 55,
                    rotationX: 8,
                    opacity: 0.35,
                  },
                  {
                    y: 0,
                    rotationX: 0,
                    opacity: 1,
                    ease: "none",
                    scrollTrigger: {
                      trigger:
                        serviceItem,
                      start: "top 92%",
                      end: "top 58%",
                      scrub: 0.7,
                    },
                    delay:
                      index * 0.02,
                  }
                );
              }
            );

          gsap.utils
            .toArray(".project-image")
            .forEach(
              (projectImage) => {
                gsap.fromTo(
                  projectImage,
                  {
                    yPercent: -5,
                    scale: 1.08,
                  },
                  {
                    yPercent: 5,
                    scale: 1,
                    ease: "none",
                    scrollTrigger: {
                      trigger:
                        projectImage,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: 0.8,
                    },
                  }
                );
              }
            );
        }

        // =========================================================
        // SPLIT TEXT REVEALS (GSAP)
        // =========================================================
        const splitElements =
          document.querySelectorAll(
            ".split-text"
          );

        splitElements.forEach((el) => {
          const words =
            el.textContent.split(" ");

          el.innerHTML = words
            .map(
              (w) =>
                `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;">
                        <span style="display:inline-block;transform:translateY(100%);">${w}</span>
                    </span>`
            )
            .join(" ");

          const innerSpans =
            el.querySelectorAll(
              "span > span"
            );

          gsap.to(innerSpans, {
            y: "0%",
            duration: 1.2,
            stagger: 0.03,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions:
                "play none none none",
            },
          });
        });

        // =========================================================
        // REVEAL UP (eyebrow, description, etc)
        // =========================================================
        document
          .querySelectorAll(".reveal-up")
          .forEach((el) => {
            gsap.from(el, {
              y: 50,
              opacity: 0,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions:
                  "play none none none",
              },
            });
          });

        // =========================================================
        // SERVICES STATEMENT — ORBIT ANIMATION
        // =========================================================
        const orbitRing1 =
          document.querySelector(
            ".orbit-ring-one"
          );

        const orbitRing2 =
          document.querySelector(
            ".orbit-ring-two"
          );

        const dot1 =
          document.querySelector(
            ".orbit-dot-one"
          );

        const dot2 =
          document.querySelector(
            ".orbit-dot-two"
          );

        if (orbitRing1) {
          gsap.to(orbitRing1, {
            rotation: 360,
            duration: 40,
            ease: "none",
            repeat: -1,
          });

          gsap.to(orbitRing2, {
            rotation: -360,
            duration: 55,
            ease: "none",
            repeat: -1,
          });

          gsap.to(dot1, {
            rotation: 360,
            duration: 18,
            ease: "none",
            repeat: -1,
          });

          gsap.to(dot2, {
            rotation: -360,
            duration: 25,
            ease: "none",
            repeat: -1,
          });
        }

        // =========================================================
        // STATEMENT SCALE ON SCROLL
        // =========================================================
        const statementTitle =
          document.querySelector(
            ".statement-title"
          );

        if (statementTitle) {
          gsap.fromTo(
            statementTitle,
            {
              scale: 0.7,
              opacity: 0.3,
            },
            {
              scale: 1,
              opacity: 1,
              duration: 1.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger:
                  ".statement-pin",
                start: "top bottom",
                end: "center center",
                scrub: 0.8,
              },
            }
          );
        }

        const statementLogo =
          document.querySelector(
            ".statement-logo"
          );

        if (statementLogo) {
          gsap.fromTo(
            statementLogo,
            {
              scale: 0.55,
              rotation: -18,
              opacity: 0,
            },
            {
              scale: () => {
                const bounds =
                  statementLogo.getBoundingClientRect();

                return (
                  Math.max(
                    window.innerWidth /
                      bounds.width,
                    window.innerHeight /
                      bounds.height
                  ) * 1.08
                );
              },
              rotation: 18,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger:
                  ".services-statement",
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                invalidateOnRefresh:
                  true,
              },
            }
          );
        }

        // =========================================================
        // HORIZONTAL GALLERY
        // =========================================================
        const galleryTrack =
          document.querySelector(
            ".horizontal-track"
          );

        const gallerySection =
          document.querySelector(
            ".horizontal-section"
          );

        if (
          galleryTrack &&
          gallerySection &&
          window.innerWidth > 768
        ) {
          gsap.to(galleryTrack, {
            x: () =>
              -(
                galleryTrack.scrollWidth -
                window.innerWidth
              ),
            ease: "none",
            scrollTrigger: {
              trigger:
                gallerySection,
              start: "top top",
              end: () =>
                `+=${Math.max(
                  0,
                  galleryTrack.scrollWidth -
                    window.innerWidth
                )}`,
              scrub: 0.7,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh:
                true,
            },
          });
        }

        // =========================================================
        // COUNTER ANIMATION
        // =========================================================
        document
          .querySelectorAll(
            "[data-counter]"
          )
          .forEach((el) => {
            const target =
              el.getAttribute(
                "data-counter"
              );

            if (target === "infinity")
              return;

            const num = parseInt(target);

            if (isNaN(num)) return;

            let current = 0;

            const increment =
              Math.ceil(num / 60);

            const trigger =
              ScrollTrigger.create({
                trigger:
                  el.closest(
                    ".number-item"
                  ),
                start: "top 85%",
                once: true,

                onEnter: () => {
                  const interval =
                    setInterval(() => {
                      current +=
                        increment;

                      if (
                        current >= num
                      ) {
                        current = num;
                        clearInterval(
                          interval
                        );
                      }

                      el.textContent =
                        current;
                    }, 30);
                },
              });
          });

        // =========================================================
        // SERVICE ITEM PREVIEW PARALLAX
        // =========================================================
        document
          .querySelectorAll(
            ".service-item"
          )
          .forEach((item) => {
            const preview =
              item.querySelector(
                ".service-preview"
              );

            if (!preview) return;

            item.addEventListener(
              "mousemove",
              (e) => {
                const rect =
                  item.getBoundingClientRect();
            menuToggle.setAttribute(
              "aria-expanded",
              isOpen
            );
            menuToggle.setAttribute(
              "aria-label",
              isOpen ? "Close navigation menu" : "Open navigation menu"
            );
                    rect.width -
                  0.5;

                const y =
                  (e.clientY -
                    rect.top) /
                    rect.height -
                  0.5;

                gsap.to(preview, {
                  x: x * 20,
                  y: y * 20,
                  rotation: x * 3,
                  duration: 0.6,
                  ease: "power1.out",
                });
              }
            );

            item.addEventListener(
              "mouseleave",
              () => {
                gsap.to(preview, {
                  x: 0,
                  y: 0,
                  rotation: 0,
                  duration: 0.8,
                  ease: "power1.out",
                });
              }
            );
          });

        // =========================================================
        // TESTIMONIAL HOVER
        // =========================================================
        document
          .querySelectorAll(
            ".testimonial"
          )
          .forEach((el) => {
            el.addEventListener(
              "mouseenter",
              () => {
                el.style.boxShadow =
                  "0 12px 40px rgba(13,15,18,0.05)";
              }
            );

            el.addEventListener(
              "mouseleave",
              () => {
                el.style.boxShadow =
                  "none";
              }
            );
          });

        // =========================================================
        // OUR CREATIVE TEAM — ISOLATED DATA + MOTION
        // =========================================================
        const oravfxTeamMembers = [
          {
            image: "ora team.jpg",
            number: "01",
            name: "Shivam Jha",
            role: "UI/UX & FRONTEND DEVELOPER",
            description:
              "Creating digital experiences, interfaces and visual systems.",
            skills:
              "UI/UX • WEB • PROTOTYPING",
            link:
              "https://shivamjhaportfolio.netlify.app/",
          },

          {
            image: "ora team.jpg",
            number: "02",
            name: "Aman",
            role: "MOTION GRAPHIK DESIGNER",
            description:
              "Shaping footage into clear, cinematic stories with rhythm and intent.",
            skills:
              "EDITING • STORY • COLOR",
            link: "#",
          },

          {
            image: "ora team.jpg",
            number: "03",
            name: "Naman Raj",
            role: "MOTION GRAPHIK DESIGNER",
            description:
              "Building expressive motion systems that make ideas move.",
            skills:
              "MOTION • 2D • TITLES",
            link: "#",
          },

          {
            image: "ora team.jpg",
            number: "04",
            name: "VIVEK SINGH",
            role: "VFX ARTIST & AI AUTOMATION",
            description:
              "Blending compositing, effects and detail into believable visual worlds.",
            skills:
              "VFX • COMPOSITING • FX",
            link: "#",
          },

          {
            image: "ora team.jpg",
            number: "05",
            name: "NISHANT MISHRA",
            role: "GRAPHIC DESIGNER & VIDEO EDITOR",
            description:
              "Translating concepts into sharp identities, layouts and visual language.",
            skills:
              "BRANDING • TYPE • ART DIRECTION",
            link: "#",
          },

          {
            image: "ora team.jpg",
            number: "06",
            name: "DHIRAJ",
            role: "3D ARTIST & ARCHITECTURE",
            description:
              "Crafting dimensional imagery, objects and spaces for digital experiences.",
            skills:
              "3D • CGI • LIGHTING",
            link: "#",
          },

          {
            image: "ora team.jpg",
            number: "07",
            name: "",
            role: "VIDEO EDITOR",
            description:
              "Turning raw material into engaging edits built for story and impact.",
            skills:
              "EDITING • SOUND • PACING",
            link: "#",
          },
        ];

        const oravfxTeamTrack =
          document.querySelector(
            ".oravfx-team-track"
          );

        if (oravfxTeamTrack) {
          const createTeamCard = (
            member,
            duplicate = false
          ) => `
            <article class="oravfx-team-card"${
              duplicate
                ? ' aria-hidden="true"'
                : ""
            }>
              <span class="oravfx-team-card-number">${member.number}</span>

              <div class="oravfx-team-card-image-wrap">
                <img
                  class="oravfx-team-card-image"
                  src="${member.image}"
                  alt="${member.name}"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div class="oravfx-team-card-content">
                <h3 class="oravfx-team-card-name">${member.name}</h3>

                <span class="oravfx-team-card-role">${member.role}</span>

                <p class="oravfx-team-card-description">
                  ${member.description}
                </p>

                <span class="oravfx-team-card-skills">
                  ${member.skills}
                </span>

                ${member.link && member.link !== "#"
                  ? `<a class="oravfx-team-profile-link" href="${member.link}" tabindex="${duplicate ? "-1" : "0"}">VIEW PROFILE ↗</a>`
                  : `<span class="oravfx-team-profile-link is-unavailable" aria-disabled="true">PROFILE COMING SOON</span>`}
              </div>
            </article>
          `;

          const sequence = [
            ...oravfxTeamMembers,
            ...oravfxTeamMembers,
          ];

          oravfxTeamTrack.innerHTML =
            sequence
              .map(
                (
                  member,
                  index
                ) =>
                  createTeamCard(
                    member,
                    index >=
                      oravfxTeamMembers.length
                  )
              )
              .join("");

          const teamCards =
            gsap.utils.toArray(
              ".oravfx-team-card"
            );

          const teamViewport =
            document.querySelector(
              ".oravfx-team-viewport"
            );

          gsap.fromTo(
            ".oravfx-team-heading-row",
            {
              y: 24,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger:
                  ".oravfx-team-section",
                start: "top 88%",
                toggleActions:
                  "play none none none",
              },
            }
          );

          gsap.from(teamCards, {
            y: 18,
            opacity: 0,
            scale: 0.96,
            duration: 0.75,
            stagger: 0.045,
            ease: "power3.out",
            scrollTrigger: {
              trigger:
                ".oravfx-team-viewport",
              start: "top 90%",
              toggleActions:
                "play none none none",
            },
          });

          const originalWidth =
            teamCards
              .slice(
                0,
                oravfxTeamMembers.length
              )
              .reduce(
                (total, card) =>
                  total + card.offsetWidth,
                0
              );

          const gap =
            parseFloat(
              getComputedStyle(
                oravfxTeamTrack
              ).gap
            ) || 0;

          const loopDistance =
            originalWidth +
            gap *
              oravfxTeamMembers.length;

          const marquee =
            gsap.to(
              oravfxTeamTrack,
              {
                x: -loopDistance,
                duration: 30,
                ease: "none",
                repeat: -1,
                paused: false,
              }
            );

          teamViewport?.addEventListener(
            "mouseenter",
            () =>
              marquee.timeScale(
                0.18
              )
          );

          teamViewport?.addEventListener(
            "mouseleave",
            () =>
              marquee.timeScale(1)
          );

          teamCards.forEach(
            (card) => {
              card.addEventListener(
                "mouseenter",
                () => {
                  gsap.to(card, {
                    y: -3,
                    duration: 0.45,
                    ease:
                      "power2.out",
                    overwrite: true,
                  });
                }
              );

              card.addEventListener(
                "mouseleave",
                () => {
                  gsap.to(card, {
                    y: 0,
                    duration: 0.5,
                    ease:
                      "power2.out",
                    overwrite: true,
                  });
                }
              );
            }
          );
        }

        // =========================================================
        // REFRESH SCROLLTRIGGER
        // =========================================================
        ScrollTrigger.refresh();

        // =========================================================
        // RESIZE HANDLER
        // =========================================================
        let resizeTimeout;

        window.addEventListener(
          "resize",
          () => {
            clearTimeout(
              resizeTimeout
            );

            resizeTimeout =
              setTimeout(() => {
                ScrollTrigger.refresh();
              }, 200);
          }
        );

        console.log(
          "OraVFX--Studio ready."
        );
      } // end initApp