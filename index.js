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

function CreateButton(pet) {
    let ItemHolder = document.querySelector('.ItemHolder');

    // Create the Item container
    let main = document.createElement('div');
    main.className = 'Item';

    main.addEventListener('click', function(){
        window.open(`PetDetails.html?petId=${pet.configName}`, '_self')
    })

    // Use template literals to set innerHTML
    main.innerHTML = `
        <div class="ImageDiv"> 
            <img src="" alt="${pet.configName}" class="Image">
        </div>
        <div class="stats-container">
            <h2 class="title">${pet.configName}</h2>
            <div class="stat-row">
                <p class="stat-name">Variant</p>
                <p class="stat-value">Normal</p>
            </div>
            <div class="stat-row">
                <p class="stat-name">Exists</p>
                <p class="stat-value">${formatInt(pet.Exists)}</p>
            </div>
            <div class="stat-row">
                <p class="stat-name">RAP</p>
                <p class="stat-value">${formatInt(pet.RAP)}</p>
            </div>
        </div>
    `;

    // Assuming 'pet.configData.thumbnail' is the URL for the image
    let assetString = pet.configData.thumbnail;
    let assetId = assetString.replace(/\D/g, '');

    // // // //
    main.querySelector('.Image').src = `https://assetdelivery.roblox.com/v1/asset?id=${assetId}`;

    // Append the main item to the item holder
    ItemHolder.appendChild(main);
}

const api_url = 'https://biggamesapi.io/api/';

async function GetData() {
    let petsResponse = await fetch(api_url + "collection/pets");
    let rawData = await petsResponse.json();

    let existsResponse = await fetch("https://biggamesapi.io/api/exists");
    let rawExistsData = await existsResponse.json();
    let existsData = rawExistsData.data


    let rapResponse = await fetch("https://biggamesapi.io/api/rap");
    let rawRapData = await rapResponse.json();
    let rapData = rawRapData.data

    // array of pets; pet are key pair values
    let pets = rawData.data;

    let hugePets = pets.filter(pet => pet.configName.includes("Huge"));

    // load some pets
    
    for (let i = 0; i < hugePets.length; i++) {
        let pet = hugePets[i];
        let petId = pet.configName
        
        let rapPet = rapData.filter(pet => pet.configData.id.includes(petId))[0];
        pet.RAP = rapPet.value

        let existsPet = existsData.filter(pet => pet.configData.id.includes(petId))[0];
        pet.Exists = existsPet.value

        CreateButton(pet)
    }

    return pets;
}

// Entry Point
document.addEventListener('DOMContentLoaded', function() {
    console.log("Loaded");
    data = GetData();

})