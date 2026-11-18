const suggestedGoals = [
  {
    id: "g1",
    name: "Drink 8 glasses of water",
    category: "Health",
    icon: "💧",
    description: "Stay hydrated and support your daily energy.",
  },
  {
    id: "g2",
    name: "Sleep for 8 hours",
    category: "Health",
    icon: "🌙",
    description: "Give your body enough time to recover.",
  },
  {
    id: "g3",
    name: "Eat 2 servings of fruit",
    category: "Health",
    icon: "🍎",
    description: "Add more natural nutrition to your day.",
  },
  {
    id: "g4",
    name: "Walk 8,000 steps",
    category: "Fitness",
    icon: "🚶",
    description: "Keep your body active throughout the day.",
  },
  {
    id: "g5",
    name: "Exercise for 30 minutes",
    category: "Fitness",
    icon: "🏋️",
    description: "Build strength and improve your fitness.",
  },
  {
    id: "g6",
    name: "Stretch for 10 minutes",
    category: "Fitness",
    icon: "🧘",
    description: "Improve flexibility and reduce stiffness.",
  },
  {
    id: "g7",
    name: "Read 20 pages",
    category: "Learning",
    icon: "📚",
    description: "Make reading part of your daily routine.",
  },
  {
    id: "g8",
    name: "Learn something new",
    category: "Learning",
    icon: "💡",
    description: "Spend time learning a useful skill.",
  },
  {
    id: "g9",
    name: "Practice coding for 30 minutes",
    category: "Learning",
    icon: "💻",
    description: "Improve your programming skills every day.",
  },
  {
    id: "g10",
    name: "Plan tomorrow's tasks",
    category: "Productivity",
    icon: "📝",
    description: "Start your next day with clarity.",
  },
  {
    id: "g11",
    name: "Avoid social media for 1 hour",
    category: "Productivity",
    icon: "📵",
    description: "Protect your focus from distractions.",
  },
  {
    id: "g12",
    name: "Complete your top priority",
    category: "Productivity",
    icon: "🎯",
    description: "Make meaningful progress on important work.",
  },
  {
    id: "g13",
    name: "Meditate for 10 minutes",
    category: "Mindfulness",
    icon: "🧘",
    description: "Create a little space for calm and focus.",
  },
  {
    id: "g14",
    name: "Write in a gratitude journal",
    category: "Mindfulness",
    icon: "✨",
    description: "Notice three things you appreciate today.",
  },
  {
    id: "g15",
    name: "Spend 10 minutes without screens",
    category: "Mindfulness",
    icon: "🌿",
    description: "Take a mindful break from technology.",
  },
];

let selectedCategory = "All";

let savedHabits = JSON.parse(localStorage.getItem("habitify-habits")) || [];

function renderSuggestions() {
  const grid = document.getElementById("suggestionGrid");

  const filtered =
    selectedCategory === "All"
      ? suggestedGoals
      : suggestedGoals.filter((goal) => goal.category === selectedCategory);

  grid.innerHTML = filtered
    .map((goal) => {
      const added = savedHabits.some(
        (habit) => habit.name.toLowerCase() === goal.name.toLowerCase(),
      );

      return `
            <div class="goal-card">
                <div class="goal-icon">${goal.icon}</div>
                <h3>${goal.name}</h3>
                <p>${goal.description}</p>
                <span class="goal-tag">${goal.category}</span>

                <button
                    class="goal-add ${added ? "added" : ""}"
                    onclick="addSuggestedGoal('${goal.id}')"
                    ${added ? "disabled" : ""}
                >
                    ${added ? "✓ Added to My Habits" : "+ Add to My Habits"}
                </button>
            </div>
        `;
    })
    .join("");
}

function filterGoals(category, button) {
  selectedCategory = category;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  button.classList.add("active");
  renderSuggestions();
}

function addSuggestedGoal(id) {
  const goal = suggestedGoals.find((item) => item.id === id);

  if (!goal) return;

  const exists = savedHabits.some(
    (habit) => habit.name.toLowerCase() === goal.name.toLowerCase(),
  );

  if (exists) {
    alert("This habit is already in your routine!");
    return;
  }

  savedHabits.push({
    id: Date.now(),
    name: goal.name,
    category: goal.category,
    completed: false,
    streak: 0,
  });

  localStorage.setItem("habitify-habits", JSON.stringify(savedHabits));

  renderSuggestions();
  renderRecommendations();
}

function openCustomGoal() {
  document.getElementById("goalModal").classList.add("show");
  document.getElementById("customName").focus();
}

function closeCustomGoal() {
  document.getElementById("goalModal").classList.remove("show");
}

function createCustomGoal() {
  const input = document.getElementById("customName");
  const category = document.getElementById("customCategory").value;
  const name = input.value.trim();

  if (!name) {
    alert("Please enter your goal!");
    return;
  }

  const exists = savedHabits.some(
    (habit) => habit.name.toLowerCase() === name.toLowerCase(),
  );

  if (exists) {
    alert("This habit already exists!");
    return;
  }

  savedHabits.push({
    id: Date.now(),
    name,
    category,
    completed: false,
    streak: 0,
  });

  localStorage.setItem("habitify-habits", JSON.stringify(savedHabits));

  input.value = "";
  closeCustomGoal();
  renderSuggestions();
  renderRecommendations();
}

document.getElementById("suggestionDate").textContent =
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

renderSuggestions();

// PERSONALIZED RECOMMENDATION ENGINE

function generateRecommendations() {
  const recommendations = [];

  const incomplete = savedHabits.filter((h) => !h.completed);
  const completed = savedHabits.filter((h) => h.completed);

  // Encourage completion of existing habits
  if (incomplete.length > 0) {
    recommendations.push({
      icon: "🎯",
      title: "Finish what you started",
      description: `You have ${incomplete.length} unfinished habits. Pick one and complete it today.`,
      category: "Focus",
    });
  }

  // Reward consistency
  const bestStreak = Math.max(0, ...savedHabits.map((h) => h.streak || 0));

  if (bestStreak >= 3) {
    recommendations.push({
      icon: "🔥",
      title: "Protect your streak",
      description: `Your best streak is ${bestStreak} days. Keep your momentum going!`,
      category: "Consistency",
    });
  }

  // Recommend neglected categories
  const categories = [
    "Health",
    "Fitness",
    "Learning",
    "Productivity",
    "Mindfulness",
  ];

  const leastUsed = categories
    .map((category) => ({
      category,
      count: savedHabits.filter((h) => h.category === category).length,
    }))
    .sort((a, b) => a.count - b.count)[0];

  if (leastUsed) {
    const suggestion = suggestedGoals.find(
      (goal) => goal.category === leastUsed.category,
    );

    if (suggestion) {
      recommendations.push({
        icon: suggestion.icon,
        title: `Explore ${leastUsed.category}`,
        description: `Try "${suggestion.name}" to bring more balance to your routine.`,
        category: "Personalized",
      });
    }
  }

  // Encourage starting a habit if none exist
  if (savedHabits.length === 0) {
    recommendations.push({
      icon: "🌱",
      title: "Start small",
      description:
        "Choose one simple habit today and begin building consistency.",
      category: "Getting Started",
    });
  }

  return recommendations;
}

function renderRecommendations() {
  const container = document.getElementById("personalRecommendations");

  if (!container) return;

  const recommendations = generateRecommendations();

  container.innerHTML = recommendations
    .map(
      (item) => `
        <div class="recommendation-card">
            <div class="recommendation-icon">${item.icon}</div>
            <span class="goal-tag">${item.category}</span>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
    `,
    )
    .join("");
}

// Render personalized recommendations
renderRecommendations();
