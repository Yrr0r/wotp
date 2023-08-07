
import totp from 'totp-generator'

console.log(atob('UGFja2VkIGJ5IFlycjByIHVzaW5nIHRvdHAtZ2VuZXJhdG9yLCAyMDIzCg=='));

let url = new URL(window.location.href)
console.log(url)
let kinput = url.searchParams.get('k')
if(kinput == undefined){
    document.getElementById('instructions').hidden = false;
    throw new Error('Key is not specified!')
}
kinput = kinput.trim()
if(kinput.slice(-1) == ';') kinput = kinput.slice(0,-1)
console.log(kinput);

let setTime = url.searchParams.get('t') || undefined;
console.log('setTime', setTime)

let keydict = kinput.split(';')
let success = false;
try{
    for(let key in keydict){
        keydict[key] = keydict[key].trim()
        let k = keydict[key].split(',')
    
        let optstrs = k.slice(2)
        let optdict = {}
        for (let entry in optstrs){
            let pair = optstrs[entry].split(':')
            optdict[pair[0]] = pair[1]
        }
        console.log(optdict)
        let dict = {
            n: k[0].trim(), // name
            k: k[1].trim(), // keystring
            o: k.slice(2), // option string
            options: optdict, // parsed options
        }
        keydict[key] = dict
    }
    success = true;
}finally{
    if(success == false){
        document.write('Format Error! Input string cannot be parsed!')
        throw new Error('Format Error!');
    }
}

console.log(keydict)

// function to calculate
function calc(keydict){
    let res = {}
    for (let each in keydict){
        let name = keydict[each].n;
        let op = keydict[each].options;
        let tokn = totp(keydict[each].k, {
            digits: op['d'] || 6,
            algorithm: op['a'] || "SHA-1",
            period: op['p'] || 30,
            timestamp: setTime || Date.now()
        }); 
        res[name] = tokn;
    }
    return res;
}

// create the list displays
var insertpos = document.getElementById('displays')
for (let item in keydict){
    let name = keydict[item].n;
    let elm = document.createElement('div');
    let infotext = (keydict[item].o)
    elm.innerHTML = `
    <h2 id="title-${name}">${name}</h2>
    <h2 id="code-${name}"></h2>
    <p>Next Refresh: <b><span id="remainSec-${name}">N/A</span></b></p>
    <pre>${infotext}</pre>
    <hr>
    `
    insertpos.appendChild(elm)
}

// refresh passwords
function refresh(){
    let timeNow = Math.floor(Date.now()/1000)
    let timeIsFixed = ''
    if(setTime){
        timeNow = setTime;
        timeIsFixed = 'FREEZED';
    }
    document.getElementById('Time').innerText = `Current Timestamp: ${timeNow} ${timeIsFixed}`

    let results = calc(keydict);
    for (let item in keydict){
        // update code
        let elm = document.getElementById('code-'+keydict[item].n)
        elm.innerText = results[(keydict[item]).n]
        // update time counter
        if(setTime == undefined){
            let remainTimeDisp = document.getElementById('remainSec-'+keydict[item].n);
            let thisPeriod = keydict[item].options.p || 30
            remainTimeDisp.innerText = thisPeriod - (timeNow % thisPeriod);
        }
    }
    //console.log('Code Updated.', timeNow);
    if(setTime == undefined) setTimeout(refresh, 1000);
}
let refreshSuccess = false;
try{
    refresh();
    refreshSuccess = true;
}finally{
    if(refreshSuccess == false){
        document.write("Incorrect format or invalid parameters!");
        throw new Error("Cannot refresh, format or value error")

    }
}
