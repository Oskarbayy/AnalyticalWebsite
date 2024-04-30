// Data
var petRAP = null;
var petExists = null;
var petId = null;

//

function formatInt(number) {
    if (number < 1000) {
      return number.toString(); // deal with numbers less than 1000
    }
    let exp = Math.floor(Math.log(number) / Math.log(1000));
    let suffix = ['K', 'M', 'B', 'T'][exp - 1];
    let shortNumber = number / Math.pow(1000, exp);
    
    // Round to 2 decimal places only if necessary
    shortNumber = shortNumber % 1 === 0 ? shortNumber : shortNumber.toFixed(2);
    
    return shortNumber + suffix;
  }
  

function getPetDetails() {
    // Extract the petId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    petId = urlParams.get('petId');
}

async function GetRap() {
    let response = await fetch("https://biggamesapi.io/api/rap");
    let rawData = await response.json();

    pets = rawData.data;

    let hugePet = pets.filter(pet => pet.configData.id.includes(petId))[0];

    petRAP = hugePet.value;
    document.getElementById('RAP').textContent = formatInt(petRAP)
}

async function GetExists() {
    let response = await fetch("https://biggamesapi.io/api/exists");
    let rawData = await response.json();

    pets = rawData.data;

    let hugePet = pets.filter(pet => pet.configData.id.includes(petId))[0];

    petExists = hugePet.value;
    document.getElementById('Exists').textContent = formatInt(petExists)
}

async function GetPet() {
    let response = await fetch("https://biggamesapi.io/api/collection/pets");
    let rawData = await response.json();

    pets = rawData.data;

    let hugePet = pets.filter(pet => pet.configName.includes(petId))[0];
    let assetString = hugePet.configData.thumbnail;
    let assetId = assetString.replace(/\D/g, '');

    // // // //
    document.querySelector('.Image').src = `https://biggamesapi.io/image/${assetId}`;
    document.getElementById('Desc').textContent = hugePet.configData.indexDesc
}

getPetDetails();

GetRap();
GetExists();
GetPet();

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('pet').textContent = petId;

})
