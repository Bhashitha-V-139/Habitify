const today = new Date();
const todayKey = today.toLocaleDateString("en-CA");

let habits = JSON.parse(localStorage.getItem("habitify-habits")) || [
  {
    id: 1,
    name: "Read 20 pages",
    category: "Learning",
    completed: false,
    streak: 3,
  },
  {
    id: 2,
    name: "Drink 2L water",
    category: "Health",
    completed: false,
    streak: 5,
  },
  {
    id: 3,
    name: "Morning workout",
    category: "Fitness",
    completed: false,
    streak: 2,
  },
  {
    id: 4,
    name: "Meditate 10 min",
    category: "Mindfulness",
    completed: false,
    streak: 7,
  },
];

let history = JSON.parse(localStorage.getItem("habitify-history")) || {};

function saveData() {
  localStorage.setItem("habitify-habits", JSON.stringify(habits));
  localStorage.setItem("habitify-history", JSON.stringify(history));
}

function renderDate() {
  document.getElementById("currentDate").textContent = today.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  );
}

function renderHabits() {
  const list = document.getElementById("habitList");

  document.getElementById("habitCount").textContent = `${habits.length} habits`;

  if (!habits.length) {
    list.innerHTML = `<div class="empty-state">No habits yet. Add your first habit!</div>`;
  } else {
    list.innerHTML = habits
      .map(
        (habit) => `
            <div class="habit-card ${habit.completed ? "completed" : ""}">
                <div class="habit-info">
                    <h3>${escapeHTML(habit.name)}</h3>
                    <p>${escapeHTML(habit.category)} · 🔥 ${habit.streak} day streak</p>
                </div>
                <div class="habit-actions">
                    <button class="complete-btn" onclick="toggleHabit(${habit.id})">
                        ${habit.completed ? "✓" : "○"}
                    </button>
                    <button class="delete-btn" onclick="deleteHabit(${habit.id})">×</button>
                </div>
            </div>
        `,
      )
      .join("");
  }

  updateProgress();
  renderWeekly();
}

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

function updateProgress() {
  const total = habits.length;
  const completed = habits.filter((h) => h.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  document.getElementById("progressPercent").textContent = percent + "%";
  document.getElementById("circlePercent").textContent = percent + "%";

  document.getElementById("progressText").textContent =
    total === 0
      ? "Add a habit to get started!"
      : completed === total
        ? "Amazing! All habits completed!"
        : `${completed} of ${total} habits completed. Keep going!`;

  const degrees = percent * 3.6;

  document.querySelector(".progress-circle").style.background =
    `conic-gradient(var(--lime) ${degrees}deg, #394139 ${degrees}deg)`;
}

function toggleHabit(id) {
  const habit = habits.find((h) => h.id === id);
  if (!habit) return;

  habit.completed = !habit.completed;

  if (habit.completed) {
    habit.streak++;
  } else {
    habit.streak = Math.max(0, habit.streak - 1);
  }

  history[todayKey] = habits.filter((h) => h.completed).map((h) => h.id);

  saveData();
  renderHabits();
}

function addHabit() {
  const nameInput = document.getElementById("habitName");
  const category = document.getElementById("habitCategory").value;
  const name = nameInput.value.trim();

  if (!name) {
    alert("Please enter a habit name!");
    return;
  }

  habits.push({
    id: Date.now(),
    name,
    category,
    completed: false,
    streak: 0,
  });

  saveData();
  renderHabits();
  nameInput.value = "";
  closeModal();
}

function deleteHabit(id) {
  if (!confirm("Delete this habit?")) return;

  habits = habits.filter((h) => h.id !== id);

  history[todayKey] = habits.filter((h) => h.completed).map((h) => h.id);

  saveData();
  renderHabits();
}

function openModal() {
  document.getElementById("habitModal").classList.add("show");
  document.getElementById("habitName").focus();
}

function closeModal() {
  document.getElementById("habitModal").classList.remove("show");
}

let currentView = "weekly";

// Switch between weekly, monthly and annual views
function changeView(view, button) {
  currentView = view;

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  button.classList.add("active");
  renderWeekly();
}

// Get completion percentage for a particular date
function getCompletion(dateKey) {
  const completed =
    dateKey === todayKey
      ? habits.filter((h) => h.completed).length
      : (history[dateKey] || []).filter((id) => habits.some((h) => h.id === id))
          .length;

  return habits.length ? Math.round((completed / habits.length) * 100) : 0;
}

// Generate analytics data
function getAnalyticsData() {
  const data = [];

  if (currentView === "weekly") {
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const key = date.toLocaleDateString("en-CA");

      data.push({
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        percent: getCompletion(key),
      });
    }
  } else if (currentView === "monthly") {
    const year = today.getFullYear();
    const month = today.getMonth();

    for (let day = 1; day <= today.getDate(); day++) {
      const date = new Date(year, month, day);
      const key = date.toLocaleDateString("en-CA");

      data.push({
        label: day,
        percent: getCompletion(key),
      });
    }
  } else if (currentView === "annual") {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      let total = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);

        if (currentDate > today) break;

        const key = currentDate.toLocaleDateString("en-CA");
        total += getCompletion(key);
      }

      const elapsedDays = Math.min(
        daysInMonth,
        Math.floor((today - new Date(year, month, 1)) / 86400000) + 1,
      );

      data.push({
        label: date.toLocaleDateString("en-US", {
          month: "short",
        }),
        percent: elapsedDays ? Math.round(total / elapsedDays) : 0,
      });
    }
  }

  return data;
}

// Render the selected analytics view
function renderWeekly() {
  const chart = document.getElementById("weeklyChart");
  const label = document.getElementById("analyticsLabel");
  const average = document.getElementById("analyticsAverage");

  const data = getAnalyticsData();

  const labels = {
    weekly: "LAST 7 DAYS",
    monthly: "THIS MONTH",
    annual: "LAST 12 MONTHS",
  };

  label.textContent = labels[currentView];

  const avg = data.length
    ? Math.round(
        data.reduce((sum, item) => sum + item.percent, 0) / data.length,
      )
    : 0;

  average.textContent = avg + "%";

  chart.className = "weekly-card";

  if (currentView === "monthly") {
    chart.classList.add("monthly-view");
  }

  if (currentView === "annual") {
    chart.classList.add("annual-view");
  }

  chart.innerHTML = data
    .map(
      (item) => `
        <div class="day">
            <span>${item.label}</span>
            <div class="day-bar">
                <div class="day-fill"
                     style="height:${item.percent}%">
                </div>
            </div>
            <small>${item.percent}%</small>
        </div>
    `,
    )
    .join("");
}

renderDate();
renderHabits();
