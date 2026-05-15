// In‑memory tree (Version 1) — each node = person
let people = [];
let rootId = null; // first person is the root

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Find person by id
function findPerson(id) {
  return people.find((p) => p.id === id);
}

// Save to localStorage
function saveToStorage() {
  localStorage.setItem("kutumbam-v1", JSON.stringify({ people, rootId }));
}

// Load from localStorage
function loadFromStorage() {
  const stored = localStorage.getItem("kutumbam-v1");
  if (stored) {
    const data = JSON.parse(stored);
    people = data.people || [];
    rootId = data.rootId || null;
  }
}

// Initialize starting person
function initRoot() {
  const name = document.getElementById("initial-name").value.trim();
  const gender = document.getElementById("initial-gender").value;

  if (!name) return alert("Please enter a name.");

  const person = {
    id: generateId(),
    name,
    gender,
    fatherId: null,
    motherId: null,
    siblingIds: [],   // brothers, sisters
    childIds: [],     // sons, daughters
  };

  people.push(person);
  rootId = person.id;
  saveToStorage();

  // Hide form, show tree
  document.getElementById("initial-form-container").style.display = "none";
  renderTree();
}

// Add a relative to a given person (father, mother, sibling, child)
function addRelative(parentId, type, isFemale = false) {
  const parent = findPerson(parentId);
  if (!parent) return;

  const name = prompt(`Enter name for the ${type} of ${parent.name}:`);
  if (!name) return;

  const gender = isFemale ? "female" : "male";

  const person = {
    id: generateId(),
    name,
    gender,
    fatherId: null,
    motherId: null,
    siblingIds: [],
    childIds: [],
  };

  people.push(person);

  // Link
  if (type === "father") {
    person.childIds = [parent.id];
    parent.fatherId = person.id;
  } else if (type === "mother") {
    person.childIds = [parent.id];
    parent.motherId = person.id;
  } else if (type === "brother" || type === "sister") {
    const isSiblingFemale = type === "sister";
    const siblingGender = isSiblingFemale ? "female" : "male";
    person.gender = siblingGender;

    // Siblings share same parents
    if (parent.fatherId) {
      person.fatherId = parent.fatherId;
      findPerson(parent.fatherId).childIds.push(person.id);
    }
    if (parent.motherId) {
      person.motherId = parent.motherId;
      findPerson(parent.motherId).childIds.push(person.id);
    }

    parent.siblingIds.push(person.id);
    person.siblingIds.push(parent.id);
  } else if (type === "son" || type === "daughter") {
    const isChildFemale = type === "daughter";
    const childGender = isChildFemale ? "female" : "male";
    person.gender = childGender;

    person.fatherId = parent.gender === "male" ? parent.id : null;
    person.motherId = parent.gender === "female" ? parent.id : null;

    if (parent.gender === "male") {
      parent.childIds.push(person.id);
    } else if (parent.gender === "female") {
      parent.childIds.push(person.id);
    }

    // If parent has a partner, we don’t assume here; could be extended later
  }

  saveToStorage();
  renderTree();
}

// Show popup for a person when clicked
function showPopup(id) {
  const person = findPerson(id);
  if (!person) return;

  document.getElementById("popup-name").textContent = person.name;

  const popup = document.getElementById("add-popup");
  popup.classList.remove("hidden");

  // All buttons will close popup and call addRelative
  function bindButton(buttonId, type, isFemale = false) {
    document.getElementById(buttonId).onclick = () => {
      popup.classList.add("hidden");
      addRelative(id, type, isFemale);
    };
  }

  bindButton("add-father", "father");
  bindButton("add-mother", "mother", true);
  bindButton("add-brother", "brother");
  bindButton("add-sister", "sister", true);
  bindButton("add-son", "son");
  bindButton("add-daughter", "daughter", true);
}

// Build flat list of nodes to render (for simplicity V1)
function getAllNodes() {
  if (!rootId) return [];

  const nodes = [];
  const seen = new Set();

  const visit = (id) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    const p = findPerson(id);
    if (!p) return;

    nodes.push(p);

    p.childIds.forEach(visit);
    if (p.fatherId) visit(p.fatherId);
    if (p.motherId) visit(p.motherId);
    p.siblingIds.forEach(visit);
  };

  visit(rootId);
  return nodes;
}

// Render all people as a centered “tree” (flat list for V1)
function renderTree() {
  const treeEl = document.getElementById("tree");
  const nodes = getAllNodes();

  if (nodes.length === 0) {
    treeEl.innerHTML = "<p>No people in the tree yet.</p>";
    return;
  }

  const html = `
    <h2>Family Hierarchy (Centered View)</h2>
    <div class="node-list">
      ${nodes
        .map(
          (p) => `
        <div
          class="person-card"
          data-id="${p.id}"
          onclick="showPopup('${p.id}')"
        >
          <strong>${p.name}</strong>
          <small>${p.gender}</small>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  treeEl.innerHTML = html;
}

// Setup event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  const initialForm = document.getElementById("initial-person-form");

  if (!rootId) {
    // Show initial form if no root exists
    initialForm.addEventListener("submit", (e) => {
      e.preventDefault();
      initRoot();
    });
  } else {
    // Already has root → hide form and render tree
    document.getElementById("initial-form-container").style.display = "none";
    renderTree();
  }

  // Global helper for popup
  window.showPopup = showPopup;
});
