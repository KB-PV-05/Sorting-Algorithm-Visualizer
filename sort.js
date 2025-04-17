const barContainer = document.getElementById("barContainer");
const speedSlider = document.getElementById("speedSlider");

let array = [];
let numBars = 50;
let barWidth = 10;
let history = [];
let currentStep = 0;
let isPaused = false;
let isStepping = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSpeed() {
  return 201 - parseInt(speedSlider.value);
}

function randomizeArray() {
  array = Array.from(
    { length: numBars },
    () => Math.floor(Math.random() * 300) + 20
  );
  history = [array.slice()];
  currentStep = 0;
  drawBars();
}

function resizeBars(value) {
  numBars = parseInt(value);
  barWidth = Math.floor(800 / numBars);
  randomizeArray();
}

function drawBars() {
  barContainer.innerHTML = "";
  array.forEach((height, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("barWrapper");

    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = `${height}px`;
    bar.style.width = `${barWidth}px`;

    const label = document.createElement("div");
    label.classList.add("valueLabel");
    label.textContent = height;

    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    barContainer.appendChild(wrapper);
  });
}

function saveHistory() {
  history.push(array.slice());
  currentStep = history.length - 1;
}

function restoreStep(index) {
  if (index >= 0 && index < history.length) {
    array = history[index].slice();
    currentStep = index;
    drawBars();
  }
}

function skipBack() {
  restoreStep(0);
}

function stepBack() {
  restoreStep(currentStep - 1);
}

function stepForward() {
  restoreStep(currentStep + 1);
}

function skipForward() {
  restoreStep(history.length - 1);
}

function togglePause() {
  isPaused = !isPaused;
}

function swap(arr, i, j) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

async function updateBars(i, j) {
  drawBars();
  const bars = document.getElementsByClassName("bar");
  if (bars[i]) bars[i].style.backgroundColor = "red";
  if (bars[j]) bars[j].style.backgroundColor = "red";
  saveHistory();
  await waitWhilePaused();
  await sleep(getSpeed());
}

async function waitWhilePaused() {
  while (isPaused) {
    await sleep(100);
  }
}

// Sorting Algorithms
async function insertionSort() {
  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      await updateBars(j, j + 1);
      j = j - 1;
    }
    array[j + 1] = key;
    saveHistory();
    drawBars();
    await waitWhilePaused();
  }
}

async function selectionSort() {
  for (let i = 0; i < array.length; i++) {
    let min = i;
    for (let j = i + 1; j < array.length; j++) {
      if (array[j] < array[min]) {
        min = j;
      }
      await updateBars(min, j);
    }
    swap(array, min, i);
    saveHistory();
    drawBars();
    await waitWhilePaused();
  }
}

async function bubbleSort() {
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (array[j] > array[j + 1]) {
        swap(array, j, j + 1);
        await updateBars(j, j + 1);
      }
    }
  }
}

async function quickSort(start, end) {
  if (start >= end) return;

  let index = await partition(start, end);
  await quickSort(start, index - 1);
  await quickSort(index + 1, end);
}

async function partition(start, end) {
  let pivot = array[end];
  let i = start - 1;

  for (let j = start; j < end; j++) {
    if (array[j] < pivot) {
      i++;
      swap(array, i, j);
      await updateBars(i, j);
    }
  }

  swap(array, i + 1, end);
  await updateBars(i + 1, end);
  return i + 1;
}

function quickSortStart() {
  quickSort(0, array.length - 1);
}

async function mergeSort(arr, l, r) {
  if (l >= r) return;

  const m = l + Math.floor((r - l) / 2);
  await mergeSort(arr, l, m);
  await mergeSort(arr, m + 1, r);
  await merge(arr, l, m, r);
}

async function merge(arr, l, m, r) {
  const left = arr.slice(l, m + 1);
  const right = arr.slice(m + 1, r + 1);

  let i = 0,
    j = 0,
    k = l;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      arr[k++] = left[i++];
    } else {
      arr[k++] = right[j++];
    }
    saveHistory();
    drawBars();
    await sleep(getSpeed());
    await waitWhilePaused();
  }

  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
  saveHistory();
  drawBars();
}

function mergeSortStart() {
  mergeSort(array, 0, array.length - 1);
}

async function shellSort() {
  let n = array.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = array[i];
      let j;
      for (j = i; j >= gap && array[j - gap] > temp; j -= gap) {
        array[j] = array[j - gap];
        await updateBars(j, j - gap);
      }
      array[j] = temp;
      saveHistory();
      drawBars();
      await waitWhilePaused();
    }
  }
}

const sizeSteps = [20, 50, 75, 100];
let currentSizeIndex = 1;

function changeSize() {
  currentSizeIndex = (currentSizeIndex + 1) % sizeSteps.length;
  const newSize = sizeSteps[currentSizeIndex];

  resizeBars(newSize);
}

function changeCanvasSize() {
  const newSize = prompt("Enter new canvas size (width x height):", "800x400");
  if (newSize) {
    const [width, height] = newSize.split("x").map(Number);
    barContainer.style.width = `${width}px`;
    barContainer.style.height = `${height}px`;
  }
}

function moveControls() {
  const controls = document.getElementById("controls");
  controls.style.position =
    controls.style.position === "absolute" ? "relative" : "absolute";
  controls.style.top = controls.style.top === "20px" ? "100px" : "20px";
  controls.style.left = controls.style.left === "20px" ? "100px" : "20px";
}

randomizeArray();
