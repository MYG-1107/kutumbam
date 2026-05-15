// In‑memory data store (Version 1)
let people = [];

// Generate unique ID (simple: timestamp-based)
function generateId() {
  return Date.now().toString(36);
}

// Add person to data
function addPerson() {
  const name = document.getElementById("name").value.trim();
  const fatherName = document.getElementById("father-name").value.trim();
  const motherName = document.getElementById("mother-name").value.trim();
  const gender = document.getElementById("gender").value;

  if (!name) return alert("Please enter a name.");

  const person = {
    id: generateId(),
    name,
    fatherName,
    motherName,
    gender,
  };

  people.push(person);
  localStorage.setItem("kinly-v1", JSON.stringify(people));

  // Clear form
  document.getElementById("person-form").reset();
  renderTree();
}

// Render the family list (simple cards)
function renderTree() {
  const treeEl = document.getElementById("tree");
  if (people.length === 0) {
    treeEl.innerHTML = `
      <h2>Family Tree</h2>
      <p>No people added yet.</p>
    `;
    return;
  }

  const html = `
    <h2>Family Tree</h2>
    ${people.map(
      (p) => `
      <div class="person-card">
        <h3>${p.name}</h3>
        <div class="relation">
          <strong>Father:</strong> ${p.fatherName || "–"}
        </div>
        <div class="relation">
          <strong>Mother:</strong> ${p.motherName || "–"}
        </div>
        <div class="gender">
          <strong>Gender:</strong> ${p.gender}
        </div>
      </div>
    `
    ).join("")}
  `;

  treeEl.innerHTML = html;
}

// Load from localStorage on page load
function loadFromStorage() {
  const stored = localStorage.getItem("kinly-v1");
  if (stored) {
    people = JSON.parse(stored);
    renderTree();
  }
}

// Setup event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();

  document
    .getElementById("person-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      addPerson();
    });
});
