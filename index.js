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
            ${pet.Variant === 'Rainbow' ? `<div class="rainbow-overlay"></div>` : ''}
        </div>
        <div class="stats-container">
            <h2 class="title">${pet.configName}</h2>
            <div class="stat-row">
                <p class="stat-name">Variant</p>
                <p class="stat-value">${pet.Variant}</p>
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
    let assetString = pet.thumbnail;
    let assetId = assetString.replace(/\D/g, '');

    // Set the image source
    main.querySelector('.Image').src = `https://biggamesapi.io/image/${assetId}`;

    return main;
}

const api_url = 'https://biggamesapi.io/api/';
let pets = null;
let existsData = null;
let rapData = null;

async function GetData() {
    const petsResponse = await fetch(api_url + "collection/pets");
    const rawData = await petsResponse.json();
    const existsResponse = await fetch(api_url + "exists");
    const rawExistsData = await existsResponse.json();
    const rapResponse = await fetch(api_url + "rap");
    const rawRapData = await rapResponse.json();

    pets = rawData.data;
    existsData = rawExistsData.data;
    rapData = rawRapData.data;


    let hugePets = pets.filter(pet => pet.configName.includes("Huge"));

    // Load all variants and store them in a single array
    let allPets = [];
    // Load Normal variants
    for (let pet of hugePets) {
        let petId = pet.configName;
        let rapPetNormal = rapData.find(p => p.configData.id === petId && !p.configData.pt && !p.configData.sh);
        let existsPetNormal = existsData.find(p => p.configData.id === petId && !p.configData.pt && !p.configData.sh);
        if (rapPetNormal && existsPetNormal) {
            let normalPet = {...pet, Variant: "Normal", thumbnail: pet.configData.thumbnail, RAP: rapPetNormal.value, Exists: existsPetNormal.value};
            allPets.push(normalPet);
        }
    }

    // Load Golden variants
    for (let pet of hugePets) {
        let petId = pet.configName;
        let rapPetGolden = rapData.find(p => p.configData.id === petId && p.configData.pt === 1 && !p.configData.sh);
        let existsPetGolden = existsData.find(p => p.configData.id === petId && p.configData.pt === 1 && !p.configData.sh);
        if (rapPetGolden && existsPetGolden && pet.configData.goldenThumbnail) {
            let goldenPet = {...pet, Variant: "Golden", thumbnail: pet.configData.goldenThumbnail, RAP: rapPetGolden.value, Exists: existsPetGolden.value};
            allPets.push(goldenPet);
        }
    }

    // Load Rainbow variants
    for (let pet of hugePets) {
        let petId = pet.configName;
        let rapPetRainbow = rapData.find(p => p.configData.id === petId && p.configData.pt === 2 && !p.configData.sh);
        let existsPetRainbow = existsData.find(p => p.configData.id === petId && p.configData.pt === 2 && !p.configData.sh);
        if (rapPetRainbow && existsPetRainbow) {
            let rainbowPet = {...pet, Variant: "Rainbow", thumbnail: pet.configData.thumbnail, RAP: rapPetRainbow.value, Exists: existsPetRainbow.value};
            allPets.push(rainbowPet);
        }
    }
    return allPets;
}


function renderPets(pets) {
    const itemHolder = document.querySelector('.ItemHolder');
    itemHolder.innerHTML = '';

    pets.forEach(pet => {
        const item = CreateButton(pet);
        itemHolder.appendChild(item);
    });
}


document.addEventListener('DOMContentLoaded', async function(){

    const allPets = await GetData();
    console.log("Get data is done")

    console.log(allPets)
    renderPets(allPets);

    const searchBox = document.getElementById('search-box');
    const normalCheckbox = document.getElementById('normal');
    const goldenCheckbox = document.getElementById('golden');
    const rainbowCheckbox = document.getElementById('rainbow');

    searchBox.addEventListener('input', filterAndSortPets);
    normalCheckbox.addEventListener('change', filterAndSortPets);
    goldenCheckbox.addEventListener('change', filterAndSortPets);
    rainbowCheckbox.addEventListener('change', filterAndSortPets);

async function filterAndSortPets() {
    const searchTerm = searchBox.value.toLowerCase();
    const normalChecked = normalCheckbox.checked;
    const goldenChecked = goldenCheckbox.checked;
    const rainbowChecked = rainbowCheckbox.checked;

    let filteredPets = allPets.filter(pet => {
        const name = pet.configName.toLowerCase();
        const matchesSearch = name.includes(searchTerm);
        const startsWithSearch = name.startsWith(searchTerm);
        const isNormal = pet.Variant === 'Normal' && normalChecked;
        const isGolden = pet.Variant === 'Golden' && goldenChecked;
        const isRainbow = pet.Variant === 'Rainbow' && rainbowChecked;
        return (matchesSearch || startsWithSearch) && (isNormal || isGolden || isRainbow);
    });

    // Custom sorting logic based on name
    filteredPets.sort((a, b) => {
        const nameA = a.configName.toLowerCase();
        const nameB = b.configName.toLowerCase();
        return nameA.indexOf(searchTerm) - nameB.indexOf(searchTerm); // Sort by position of search term
    });

    // Render the filtered and sorted pets
    renderPets(filteredPets);
}

});


