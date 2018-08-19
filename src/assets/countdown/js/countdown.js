///////////////////////////////////////////////////
// variables



let time,
    countDownDate = new Date
    ("August 1, 2019 07:23:00").getTime(),
    reverseFlapDirection = false,
    bgColor = "49, 51, 51",
    fontColor = "204,204,204",
    segments = 10,

    html = "",
    div = document.querySelector(".center"),
    splitFlaps = [];

setInterval(updateTime, 10);
///////////////////////////////////////////////////
// set up html
for (var x = 0; x < 9; x++) {    // [!!] <-- changed from x < 8, to x < 9
  html +=                        //  now there are 9 flaps (3 for days)
    `<div class=splitflap>
        <div class="front-top"></div>
        <div class="front-full"></div>
        <div class="back-top"></div>
        <div class="back-full"></div>
    </div>`;
}
div.innerHTML = html;
document.documentElement.style.setProperty("--rgb", bgColor);
document.documentElement.style.setProperty("--fontColor", fontColor);
document.documentElement.style.setProperty("--segments", segments);
document.documentElement.style.setProperty("--animationDirection",
reverseFlapDirection ? "reverse" : "normal");

document.querySelectorAll(".splitflap").forEach(element => {
  let array = element.querySelectorAll("div");
  splitFlaps.push(array);
});
///////////////////////////////////////////
// time functions
function updateTime() {
  time = separateIntoSingleDigits(currentTimeLeft());

  setTimeout(()=>{
    if (prevSecond !== time[time.length-1]){  // [!!] <---- i fixed this. it should always check the last second digit
    time.forEach((num, i) => doSplitflap(splitFlaps[i], num));
    prevSecond = time[time.length-1]  // [!!] <--- as above, i needed to fix. now it won't interefere when you add more day flaps
  }

  },100)

}
///////////////////////////////////////////

let prevSecond;
let currentTimeLeft = function() {
  let now = new Date().getTime(),
      distance = countDownDate - now;

  let days = Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (distance < 0) {
    clearInterval(currentTimeLeft);
    return ["Co", "mp", "le", "te"]; }
  else {
    return [days, hours, minutes, seconds];
  }
}
///////////////////////////////////////////
function separateIntoSingleDigits(time, days) {
  return time
    .map((num,i) => {
    if (i == 0) return String(num).padStart(3,"0");  // <--- [!!] added this if statement to map function
    return ("0" + num.toString()).slice(-2)         // time[0] contains the amount of days, i == 0 checks if index = days
  }).join("")                                 // padStart does the same as ("0" + num.toString()).slice(-2) does
    .split("");                             // it just adds extra 0s to the time when necessary. 1 day becomes 001 days
}                                          // make sure to change # in padStart to the amount of day flaps you have
///////////////////////////////////////////
function doSplitflap(splitflapGroup, num) {
  const [frontTop, frontFull, backTop, backFull] = splitflapGroup;

  if (reverseFlapDirection) flapDirection(backTop,frontTop,backFull,frontFull)
  else flapDirection(frontTop,backTop,frontFull,backFull)

  function flapDirection(top1,top2,full1,full2){
    if (num !== top1.innerHTML) {
      top1.innerHTML = full1.innerHTML = top2.innerHTML;
      top2.innerHTML = full2.innerHTML = num;

      if (num !== top1.innerHTML)
        animate(frontFull,"flip1"), animate(backTop,"flip2");
    }
  }
}
///////////////////////////////////////////
function animate(el, cssClass) {
  el.classList.remove(cssClass);
  el.offsetWidth = el.offsetWidth;
  el.classList.add(cssClass);
}
