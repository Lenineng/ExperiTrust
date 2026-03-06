document.addEventListener("DOMContentLoaded", () => {
  const defaultApiBase = `${window.location.protocol}//${window.location.hostname}:5001/api`;
  const API_BASE = localStorage.getItem("experitrust_api_base") || defaultApiBase;
  const path = window.location.pathname.toLowerCase();

  const isLoginPage = path.endsWith("login.html");
  const isSignupPage = path.endsWith("signup.html");
  const isDashboardPage = path.includes("-dashboard.html");
  const isSettingsPage = path.includes("-settings.html");

  const roleFromPath = () => {
    if (path.includes("student-")) return "student";
    if (path.includes("employer-")) return "employer";
    if (path.includes("admin-")) return "admin";
    return null;
  };

  const pageRole = roleFromPath();

  const dashboardRoutes = {
    student: "student-dashboard.html",
    employer: "employer-dashboard.html",
    admin: "admin-dashboard.html",
  };

  const redirectToRoleDashboard = (role) => {
    window.location.href = dashboardRoutes[role] || "login.html";
  };

  const createInlineMessage = (container) => {
    const node = document.createElement("p");
    node.style.marginTop = "10px";
    node.style.fontSize = "14px";
    container.appendChild(node);
    return (text, isError = false) => {
      node.textContent = text || "";
      node.style.color = isError ? "#b42318" : "#067647";
    };
  };

  const setLoading = (button, on, loadingText) => {
    if (!button) return;
    if (on) {
      button.dataset.originalText = button.textContent;
      button.textContent = loadingText || "Please wait...";
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  };

  const ensureToastRoot = () => {
    let root = document.getElementById("toast-root");
    if (root) return root;
    root = document.createElement("div");
    root.id = "toast-root";
    root.style.position = "fixed";
    root.style.top = "18px";
    root.style.right = "18px";
    root.style.display = "grid";
    root.style.gap = "10px";
    root.style.zIndex = "9999";
    document.body.appendChild(root);
    return root;
  };

  const showToast = (message, type = "info") => {
    const root = ensureToastRoot();
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.minWidth = "240px";
    toast.style.maxWidth = "360px";
    toast.style.padding = "10px 12px";
    toast.style.borderRadius = "10px";
    toast.style.fontSize = "13px";
    toast.style.color = "#fff";
    toast.style.boxShadow = "0 8px 20px rgba(0,0,0,.18)";
    toast.style.background =
      type === "error" ? "#b42318" : type === "success" ? "#067647" : "#1d3d86";
    root.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2800);
  };

  const fetchJson = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (_) {
      payload = null;
    }

    if (!response.ok) {
      const error = new Error(payload?.message || `Request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return payload;
  };

  const authFetch = async (endpoint, options = {}) => {
    try {
      return await fetchJson(endpoint, options);
    } catch (error) {
      if (error.status === 401 && (isDashboardPage || isSettingsPage)) {
        window.location.href = `login.html${pageRole ? `?role=${pageRole}` : ""}`;
      }
      throw error;
    }
  };

  const getInitials = (name) => {
    const words = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "ET";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  const bindRoleTabs = () => {
    const roleTabs = document.querySelectorAll(".role-tab");
    if (!roleTabs.length) return;
    roleTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        roleTabs.forEach((node) => node.classList.remove("active"));
        tab.classList.add("active");
      });
    });
  };

  const bindAuthForm = () => {
    const form = document.querySelector(".auth-form");
    const submitBtn = form?.querySelector(".auth-submit");
    if (!form || !submitBtn) return;

    const setMessage = createInlineMessage(form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setMessage("");
      setLoading(submitBtn, true, isSignupPage ? "Creating..." : "Signing in...");

      try {
        if (isSignupPage) {
          const name = form.querySelector('input[type="text"]')?.value?.trim();
          const email = form.querySelector('input[type="email"]')?.value?.trim();
          const passwords = form.querySelectorAll('input[type="password"]');
          const password = passwords[0]?.value || "";
          const confirm = passwords[1]?.value || "";
          const role = document.querySelector(".role-tab.active")?.getAttribute("data-role") || "student";

          if (password !== confirm) throw new Error("Passwords do not match");

          const user = await fetchJson("/auth/signup", {
            method: "POST",
            body: JSON.stringify({ fullName: name, email, password, role }),
          });

          setMessage("Account created successfully");
          redirectToRoleDashboard(user.role || role);
          return;
        }

        const email = form.querySelector('input[type="email"]')?.value?.trim();
        const password = form.querySelector('input[type="password"]')?.value || "";
        const user = await fetchJson("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        setMessage("Login successful");
        redirectToRoleDashboard(user.role);
      } catch (error) {
        setMessage(error.message, true);
      } finally {
        setLoading(submitBtn, false);
      }
    });
  };

  const bindLogout = () => {
    document.querySelectorAll(".dash-logout").forEach((link) => {
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await fetchJson("/auth/logout", { method: "POST" });
        } catch (_) {
          // ignore
        }
        window.location.href = "login.html";
      });
    });
  };

  const bindModalAndTabs = () => {
    const modalTriggers = document.querySelectorAll("[data-modal]");
    const modalClosers = document.querySelectorAll("[data-close]");

    modalTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const targetId = trigger.getAttribute("data-modal");
        const modal = document.getElementById(targetId);
        if (modal) modal.classList.add("active");
      });
    });

    modalClosers.forEach((closer) => {
      closer.addEventListener("click", () => {
        const modal = closer.closest(".modal-overlay");
        if (modal) modal.classList.remove("active");
      });
    });

    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("active");
      });
    });

    const tabs = document.querySelectorAll(".dash-tab[data-tab]");
    const sections = document.querySelectorAll(".dash-section[data-section]");
    if (!tabs.length || !sections.length) return;

    const setActive = (target) => {
      sections.forEach((section) => {
        const active = section.getAttribute("data-section") === target;
        section.hidden = !active;
        section.classList.toggle("active", active);
      });
    };

    const initial = document.querySelector(".dash-tab.active")?.getAttribute("data-tab") || tabs[0].getAttribute("data-tab");
    setActive(initial);

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((item) => item.classList.remove("active"));
        tab.classList.add("active");
        setActive(tab.getAttribute("data-tab"));
      });
    });
  };

  const clearSectionCards = (section, selector) => {
    section.querySelectorAll(selector).forEach((node) => node.remove());
  };

  const setHeaderUser = (user) => {
    const initials = getInitials(user.fullName || user.email);
    const headerCircle = document.querySelector(".dash-user .employer-initials");
    if (headerCircle) headerCircle.textContent = initials;

    const settingsCircle = document.querySelector(".settings-avatar");
    const settingsNameNode = document.querySelector(".settings-head h1, .settings-head p");
    const settingsEmailNode = document.querySelector(".settings-email");
    if (settingsCircle) settingsCircle.textContent = initials;
    if (settingsNameNode) settingsNameNode.textContent = user.fullName || "";
    if (settingsEmailNode) settingsEmailNode.textContent = user.email || "";
  };

  const setStats = (stats) => {
    const rows = document.querySelectorAll(".dash-stats .dash-stat strong");
    if (!rows.length) return;

    if (pageRole === "student") {
      rows[0].textContent = String(stats.totalExperienceYears ?? 0);
      rows[1].textContent = String(stats.verifiedExperiences ?? 0);
      rows[2].textContent = String(stats.applications ?? 0);
      rows[3].textContent = `${stats.profileCompletion ?? 0}%`;
    } else if (pageRole === "employer") {
      rows[0].textContent = String(stats.activeJobs ?? 0);
      rows[1].textContent = String(stats.totalApplicants ?? 0);
      rows[2].textContent = String(stats.shortlisted ?? 0);
      rows[3].textContent = String(stats.interviews ?? 0);
    } else if (pageRole === "admin") {
      rows[0].textContent = String(stats.pendingVerifications ?? 0);
      rows[1].textContent = String(stats.totalStudents ?? 0);
      rows[2].textContent = String(stats.verifiedToday ?? 0);
      rows[3].textContent = String(stats.activeJobs ?? 0);
    }
  };

  const renderStudentDashboard = async (user) => {
    const [dashboard, jobs, applications] = await Promise.all([
      authFetch("/student/dashboard"),
      authFetch("/student/jobs"),
      authFetch("/student/applications"),
    ]);

    setStats(dashboard.stats || {});

    const infoRows = document.querySelectorAll('[data-section="overview"] .dash-info div');
    if (infoRows.length >= 4) {
      infoRows[0].innerHTML = `<span>University:</span> ${user.university || "-"}`;
      infoRows[1].innerHTML = `<span>Field of Study:</span> ${user.fieldOfStudy || "-"}`;
      infoRows[2].innerHTML = `<span>Education Level:</span> ${user.educationLevel || "-"}`;
      infoRows[3].innerHTML = `<span>Email:</span> ${user.email || "-"}`;
    }

    const experiencesSection = document.querySelector('[data-section="experiences"]');
    if (experiencesSection) {
      clearSectionCards(experiencesSection, ".experience-card");
      (dashboard.experiences || []).forEach((exp) => {
        const card = document.createElement("article");
        card.className = "experience-card";
        card.innerHTML = `
          <div>
            <h4>${exp.title}</h4>
            <p>${exp.type} - ${exp.duration} ${exp.durationUnit}</p>
            <div class="experience-meta">
              <div><span>Submitted:</span> ${new Date(exp.createdAt).toISOString().slice(0, 10)}</div>
              <div><span>Reviewed:</span> ${exp.reviewedAt ? new Date(exp.reviewedAt).toISOString().slice(0, 10) : "-"}</div>
              <div><span>Equivalence:</span> <strong>${exp.equivalenceYears || 0} years</strong></div>
            </div>
          </div>
          <span class="status-pill ${exp.status}">${exp.status}</span>
        `;
        experiencesSection.appendChild(card);
      });
    }

    const jobsSection = document.querySelector('[data-section="jobs"]');
    if (jobsSection) {
      clearSectionCards(jobsSection, ".job-card");
      jobs.forEach((job) => {
        const card = document.createElement("article");
        card.className = "job-card";
        card.setAttribute("data-job", "");
        card.innerHTML = `
          <div class="job-main">
            <div>
              <h4>${job.title}</h4>
              <p>${job.employer?.fullName || "Employer"}</p>
            </div>
            <button class="apply-btn" type="button" data-job-id="${job._id}">Apply now</button>
          </div>
          <div class="job-meta">
            <span><img class="meta-icon" src="icons/mi_location.png" alt="" /> ${job.location}</span>
            <span><img class="meta-icon" src="icons/calendar.png" alt="" /> ${job.jobType}</span>
            <span><img class="meta-icon" src="icons/time.png" alt="" /> Required: ${job.requiredExperienceYears} years</span>
          </div>
        `;
        jobsSection.appendChild(card);
      });

      jobsSection.querySelectorAll("[data-job-id]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const jobId = btn.getAttribute("data-job-id");
          const notes = prompt("Application notes (optional)") || "";
          try {
            await authFetch("/student/applications", {
              method: "POST",
              body: JSON.stringify({ jobId, notes }),
            });
            showToast("Application submitted", "success");
            window.location.reload();
          } catch (error) {
            showToast(error.message, "error");
          }
        });
      });
    }

    const appsSection = document.querySelector('[data-section="applications"]');
    if (appsSection) {
      clearSectionCards(appsSection, ".job-card");
      applications.forEach((app) => {
        const card = document.createElement("article");
        card.className = "job-card";
        card.innerHTML = `
          <div class="job-main">
            <div>
              <h4>${app.job?.title || "-"}</h4>
              <p>${app.employer?.fullName || "-"}</p>
            </div>
            <span class="status-pill pending">${app.status}</span>
          </div>
          <div class="job-footer">
            <span>Applied: ${new Date(app.createdAt).toISOString().slice(0, 10)}</span>
          </div>
        `;
        appsSection.appendChild(card);
      });
    }

    const experienceForm = document.querySelector("#experience-modal .modal-form");
    if (experienceForm) {
      const submitBtn = experienceForm.querySelector('button[type="submit"]');
      experienceForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fields = experienceForm.querySelectorAll("input, select, textarea");
        setLoading(submitBtn, true, "Submitting...");
        try {
          await authFetch("/student/experiences", {
            method: "POST",
            body: JSON.stringify({
              title: fields[0]?.value?.trim(),
              type: fields[1]?.value?.trim(),
              startDate: fields[2]?.value?.trim(),
              endDate: fields[3]?.value?.trim(),
              duration: Number(fields[4]?.value?.trim()),
              durationUnit: fields[5]?.value?.trim(),
              description: fields[6]?.value?.trim(),
              supportingEvidence: fields[7]?.value?.trim(),
              cvUrl: "",
            }),
          });
          window.location.reload();
        } catch (error) {
          showToast(error.message, "error");
        } finally {
          setLoading(submitBtn, false);
        }
      });
    }
  };

  const renderEmployerDashboard = async (user) => {
    const [dashboard, applicants] = await Promise.all([
      authFetch("/employer/dashboard"),
      authFetch("/employer/applicants"),
    ]);
    setStats(dashboard.stats || {});

    const infoRows = document.querySelectorAll('[data-section="overview"] .dash-info div');
    if (infoRows.length >= 4) {
      infoRows[0].innerHTML = `<span>Company Name:</span> ${user.fullName || "-"}`;
      infoRows[1].innerHTML = `<span>Industry:</span> ${user.industry || "-"}`;
      infoRows[2].innerHTML = `<span>Location:</span> ${user.location || "-"}`;
      infoRows[3].innerHTML = `<span>Email:</span> ${user.email || "-"}`;
    }

    const jobsSection = document.querySelector('[data-section="jobs"]');
    if (jobsSection) {
      clearSectionCards(jobsSection, ".job-card");
      (dashboard.jobs || []).forEach((job) => {
        const card = document.createElement("article");
        card.className = "job-card";
        card.innerHTML = `
          <div class="job-main">
            <div><h4>${job.title}</h4></div>
            <span class="status-pill ${job.status === "open" ? "verified" : "rejected"}">${job.status}</span>
          </div>
          <div class="job-meta">
            <span><img class="meta-icon" src="icons/mi_location.png" alt="" /> ${job.location}</span>
            <span><img class="meta-icon" src="icons/calendar.png" alt="" /> ${job.jobType}</span>
            <span><img class="meta-icon" src="icons/time.png" alt="" /> Required: ${job.requiredExperienceYears} years</span>
          </div>
          <div class="job-footer">
            <span>Posted: ${new Date(job.createdAt).toISOString().slice(0, 10)}</span>
            <div class="job-actions">
              <button class="link-btn danger" type="button" data-close-job-id="${job._id}">Close</button>
            </div>
          </div>
        `;
        jobsSection.appendChild(card);
      });

      jobsSection.querySelectorAll("[data-close-job-id]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-close-job-id");
          try {
            await authFetch(`/employer/jobs/${id}/close`, { method: "PATCH" });
            showToast("Job closed", "success");
            window.location.reload();
          } catch (error) {
            showToast(error.message, "error");
          }
        });
      });
    }

    const applicantsSection = document.querySelector('[data-section="applicants"]');
    let selectedApplicationId = null;
    if (applicantsSection) {
      clearSectionCards(applicantsSection, ".applicant-card");
      applicants.forEach((app) => {
        const card = document.createElement("article");
        card.className = "applicant-card";
        card.innerHTML = `
          <div class="applicant-header">
            <div class="avatar">${getInitials(app.student?.fullName || "ST")}</div>
            <div>
              <h4>${app.student?.fullName || "-"}</h4>
              <p>${app.student?.university || "-"} - ${app.student?.fieldOfStudy || "-"}</p>
              <p>Applied for: <strong>${app.job?.title || "-"}</strong></p>
            </div>
          </div>
          <div class="applicant-right">
            <span class="exp-years">${app.studentTotalExperience || 0} years</span>
            <span class="status-pill pending">${app.status}</span>
          </div>
          <div class="applicant-footer">
            <span>Applied: ${new Date(app.createdAt).toISOString().slice(0, 10)}</span>
            <div class="applicant-actions">
              <button class="modal-primary small" type="button" data-update-app="${app._id}" data-status="shortlisted">Shortlist</button>
              <button class="modal-outline small danger" type="button" data-update-app="${app._id}" data-status="rejected">Reject</button>
              <button class="modal-primary small" type="button" data-modal="schedule-modal" data-pick-application="${app._id}">Schedule Interview</button>
            </div>
          </div>
        `;
        applicantsSection.appendChild(card);
      });

      applicantsSection.querySelectorAll("[data-update-app]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-update-app");
          const status = btn.getAttribute("data-status");
          try {
            await authFetch(`/employer/applications/${id}/status`, {
              method: "PATCH",
              body: JSON.stringify({ status }),
            });
            showToast("Application updated", "success");
            window.location.reload();
          } catch (error) {
            showToast(error.message, "error");
          }
        });
      });

      applicantsSection.querySelectorAll("[data-pick-application]").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectedApplicationId = btn.getAttribute("data-pick-application");
        });
      });
    }

    const scheduleForm = document.querySelector("#schedule-modal .modal-form");
    if (scheduleForm) {
      const submitBtn = scheduleForm.querySelector('button[type="submit"]');
      scheduleForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!selectedApplicationId) {
          showToast("Pick an application first", "error");
          return;
        }
        const fields = scheduleForm.querySelectorAll("input, textarea");
        const date = fields[0]?.value?.trim();
        const time = fields[1]?.value?.trim();
        const notes = fields[2]?.value?.trim() || "";
        const iso = time ? new Date(`${date}T${time}:00`).toISOString() : new Date(date).toISOString();
        setLoading(submitBtn, true, "Scheduling...");
        try {
          await authFetch("/employer/interviews", {
            method: "POST",
            body: JSON.stringify({
              applicationId: selectedApplicationId,
              interviewDate: iso,
              notes,
            }),
          });
          showToast("Interview scheduled", "success");
          window.location.reload();
        } catch (error) {
          showToast(error.message, "error");
        } finally {
          setLoading(submitBtn, false);
        }
      });
    }

    const postJobForm = document.querySelector("#post-job-modal .modal-form");
    if (postJobForm) {
      const submitBtn = postJobForm.querySelector('button[type="submit"]');
      postJobForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fields = postJobForm.querySelectorAll("input, select, textarea");
        const rawType = fields[1]?.value?.trim() || "";
        const jobType = rawType === "Full Time" ? "Full-time" : rawType === "Part Time" ? "Part-time" : rawType;
        const requiredExperienceYears = Number(fields[3]?.value?.trim());

        if (Number.isNaN(requiredExperienceYears) || requiredExperienceYears < 0) {
          showToast("Required experience must be a valid number (e.g 1 or 1.5)", "error");
          return;
        }

        setLoading(submitBtn, true, "Posting...");
        try {
          await authFetch("/employer/jobs", {
            method: "POST",
            body: JSON.stringify({
              title: fields[0]?.value?.trim(),
              jobType,
              location: fields[2]?.value?.trim(),
              requiredExperienceYears,
              description: fields[4]?.value?.trim(),
            }),
          });
          showToast("Job posted", "success");
          window.location.reload();
        } catch (error) {
          showToast(error.message, "error");
        } finally {
          setLoading(submitBtn, false);
        }
      });
    }
  };

  const renderAdminDashboard = async () => {
    const [dashboard, pending, verified, students] = await Promise.all([
      authFetch("/admin/dashboard"),
      authFetch("/admin/experiences/pending"),
      authFetch("/admin/experiences/verified"),
      authFetch("/admin/students"),
    ]);
    setStats(dashboard.stats || {});

    let selectedExperienceId = null;

    const pendingSection = document.querySelector('[data-section="pending"]');
    if (pendingSection) {
      clearSectionCards(pendingSection, ".admin-card");
      pending.forEach((exp) => {
        const card = document.createElement("article");
        card.className = "admin-card";
        card.innerHTML = `
          <div class="admin-card-header">
            <div>
              <h4>${exp.title}</h4>
              <p>${exp.student?.fullName || "-"} - ${exp.student?.university || "-"}</p>
            </div>
            <span class="status-pill pending">pending</span>
          </div>
          <div class="admin-meta">
            <span><img class="meta-icon dark" src="icons/my%20experience.png" alt="" /> ${exp.type}</span>
            <span><img class="meta-icon" src="icons/time.png" alt="" /> ${exp.duration} ${exp.durationUnit}</span>
            <span><img class="meta-icon" src="icons/calendar.png" alt="" /> Submitted: ${new Date(exp.createdAt).toISOString().slice(0, 10)}</span>
          </div>
          <div class="admin-block"><strong>Description:</strong><p>${exp.description || "-"}</p></div>
          <div class="admin-block"><strong>Evidence:</strong><p>${exp.supportingEvidence || "-"}</p></div>
          <div class="admin-actions">
            <button class="dash-btn primary" type="button" data-modal="verify-modal" data-exp-id="${exp._id}">Review &amp; Verify</button>
          </div>
        `;
        pendingSection.appendChild(card);
      });

      pendingSection.querySelectorAll("[data-exp-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectedExperienceId = btn.getAttribute("data-exp-id");
          const verifyModal = document.getElementById("verify-modal");
          if (verifyModal) verifyModal.classList.add("active");
        });
      });
    }

    const verifiedSection = document.querySelector('[data-section="verified"]');
    if (verifiedSection) {
      clearSectionCards(verifiedSection, ".job-card");
      verified.forEach((exp) => {
        const card = document.createElement("article");
        card.className = "job-card";
        card.innerHTML = `
          <div class="job-main">
            <div><h4>${exp.title}</h4><p>${exp.student?.fullName || "-"}</p></div>
            <div class="right-stack">
              <span class="exp-years">${exp.equivalenceYears || 0} years</span>
              <span class="status-pill verified">Verified</span>
            </div>
          </div>
        `;
        verifiedSection.appendChild(card);
      });
    }

    const studentsSection = document.querySelector('[data-section="students"]');
    if (studentsSection) {
      clearSectionCards(studentsSection, ".student-card");
      students.forEach((student) => {
        const card = document.createElement("article");
        card.className = "student-card";
        card.innerHTML = `
          <div class="student-header">
            <div class="avatar">${getInitials(student.fullName)}</div>
            <div>
              <h4>${student.fullName}</h4>
              <p>${student.university || "-"} - ${student.fieldOfStudy || "-"}</p>
              <p>${student.email || "-"}</p>
            </div>
          </div>
          <div class="student-right">
            <span class="exp-years">${student.totalExperience || 0} years</span>
            <div class="student-counts">
              <span class="verified-count">${student.verifiedCount || 0} verified</span>
              <span class="pending-count">${student.pendingCount || 0} pending</span>
            </div>
          </div>
        `;
        studentsSection.appendChild(card);
      });
    }

    const verifyModal = document.getElementById("verify-modal");
    const verifyBtn = verifyModal?.querySelector(".modal-primary");
    const rejectBtn = verifyModal?.querySelector(".modal-outline.danger");
    const equivalenceInput = verifyModal?.querySelector('input[placeholder*="0.5"]');
    const notesInput = verifyModal?.querySelector("textarea");

    if (verifyBtn) {
      verifyBtn.addEventListener("click", async () => {
        if (!selectedExperienceId) {
          showToast("Select an experience to verify", "error");
          return;
        }
        try {
          await authFetch(`/admin/experiences/${selectedExperienceId}/verify`, {
            method: "PATCH",
            body: JSON.stringify({
              equivalenceYears: Number(equivalenceInput?.value || 0),
              adminNotes: notesInput?.value || "",
            }),
          });
          showToast("Experience verified", "success");
          window.location.reload();
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener("click", async () => {
        if (!selectedExperienceId) {
          showToast("Select an experience to reject", "error");
          return;
        }
        try {
          await authFetch(`/admin/experiences/${selectedExperienceId}/reject`, {
            method: "PATCH",
            body: JSON.stringify({ adminNotes: notesInput?.value || "" }),
          });
          showToast("Experience rejected", "success");
          window.location.reload();
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    }
  };

  const bindSettingsForm = async (user) => {
    const form = document.querySelector(".settings-form");
    if (!form) return;
    const inputs = Array.from(form.querySelectorAll("input"));
    const msgNode = form.querySelector(".settings-message");

    const applyValues = () => {
      inputs.forEach((input) => {
        if (input.id.includes("name")) input.value = user.fullName || "";
        if (input.id.includes("email")) input.value = user.email || "";
        if (input.id.includes("location")) input.value = user.location || "";
        if (input.id.includes("university")) input.value = user.university || "";
        if (input.id.includes("field")) input.value = user.fieldOfStudy || "";
        if (input.id.includes("level")) input.value = user.educationLevel || "";
        if (input.id.includes("industry")) input.value = user.industry || "";
      });
    };

    const toPayload = () => {
      const payload = {};
      inputs.forEach((input) => {
        const value = input.value.trim();
        if (input.id.includes("name")) payload.fullName = value;
        if (input.id.includes("email")) payload.email = value;
        if (input.id.includes("location")) payload.location = value;
        if (input.id.includes("university")) payload.university = value;
        if (input.id.includes("field")) payload.fieldOfStudy = value;
        if (input.id.includes("level")) payload.educationLevel = value;
        if (input.id.includes("industry")) payload.industry = value;
      });
      return payload;
    };

    applyValues();
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msgNode) msgNode.textContent = "";
      setLoading(submitBtn, true, "Saving...");
      try {
        await authFetch("/auth/update-profile", {
          method: "PUT",
          body: JSON.stringify(toPayload()),
        });
        if (msgNode) msgNode.textContent = "Changes saved";
        window.location.href = dashboardRoutes[pageRole] || "login.html";
      } catch (error) {
        if (msgNode) msgNode.textContent = error.message;
      } finally {
        setLoading(submitBtn, false);
      }
    });

    const cancelBtn = form.querySelector(".settings-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        applyValues();
        window.location.href = dashboardRoutes[pageRole] || "login.html";
      });
    }
  };

  const bootProtectedPage = async () => {
    const user = await authFetch("/auth/check");
    if (pageRole && user.role !== pageRole) {
      redirectToRoleDashboard(user.role);
      return;
    }

    setHeaderUser(user);
    bindLogout();
    bindModalAndTabs();

    if (isDashboardPage) {
      if (pageRole === "student") await renderStudentDashboard(user);
      if (pageRole === "employer") await renderEmployerDashboard(user);
      if (pageRole === "admin") await renderAdminDashboard();
    }

    if (isSettingsPage) {
      await bindSettingsForm(user);
    }
  };

  bindRoleTabs();

  if (isLoginPage || isSignupPage) {
    bindAuthForm();
    return;
  }

  if (isDashboardPage || isSettingsPage) {
    bootProtectedPage().catch(() => {
      window.location.href = `login.html${pageRole ? `?role=${pageRole}` : ""}`;
    });
  }
});
