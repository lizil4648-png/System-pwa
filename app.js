const stats = {
  strength: 10,
  agility: 10,
  endurance: 10,
  intelligence: 10
};

const quests = [
  { text: "Сделать 10 приседаний", stat: "strength", reward: 1 },
  { text: "Сделать растяжку 5 минут", stat: "agility", reward: 1 },
  { text: "Пройти 2 км пешком", stat: "endurance", reward: 1 },
  { text: "Прочитать 5 страниц книги", stat: "intelligence", reward: 1 }
];

function renderQuests() {
  const questList = document.getElementById("quest-list");
  questList.innerHTML = "";
  quests.forEach((quest, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${quest.text} 
      <button onclick="completeQuest(${i})">Выполнено</button>`;
    questList.appendChild(li);
  });
}

function completeQuest(i) {
  const quest = quests[i];
  stats[quest.stat] += quest.reward;
  document.getElementById(quest.stat).textContent = stats[quest.stat];
  alert(`+${quest.reward} к ${quest.stat}`);
}

renderQuests();
