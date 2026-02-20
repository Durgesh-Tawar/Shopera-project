let spinResult = document.getElementById("spinResult");
let wheel = document.getElementById("wheel");

function spinWheel(){
    let lastSpin = localStorage.getItem("lastSpin");
    let today = new Date().toDateString();
    if(lastSpin===today){
        spinResult.innerText = "You can spin only once per day!";
        return;
    }

    let discount = [10,15,20,25,30];
    let won = discount[Math.floor(Math.random()*discount.length)];

    // store discount
    localStorage.setItem("discount", won);
    localStorage.setItem("lastSpin", today);

    spinResult.innerText = `🎉 You won ${won}% discount!`;
    let degree = 3600 + (won*12);
    wheel.style.transform = `rotate(${degree}deg)`;
}