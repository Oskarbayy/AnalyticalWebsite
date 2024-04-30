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
        const searchTerms = searchTerm.split(' ').filter(term => term.trim() !== ''); // Split into individual words and remove empty entries
        const normalChecked = normalCheckbox.checked;
        const goldenChecked = goldenCheckbox.checked;
        const rainbowChecked = rainbowCheckbox.checked;
    
        // Function to calculate Levenshtein distance
        function getLevenshteinDistance(a, b) {
            const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    
            for (let i = 0; i <= a.length; i += 1) {
                matrix[0][i] = i;
            }
            for (let j = 0; j <= b.length; j += 1) {
                matrix[j][0] = j;
            }
    
            for (let j = 1; j <= b.length; j += 1) {
                for (let i = 1; i <= a.length; i += 1) {
                    const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                    matrix[j][i] = Math.min(
                        matrix[j][i - 1] + 1, // deletion
                        matrix[j - 1][i] + 1, // insertion
                        matrix[j - 1][i - 1] + indicator, // substitution
                    );
                }
            }
    
            return matrix[b.length][a.length];
        }
    
        // Function to calculate a customized fuzzy match score using Levenshtein distance
        function calculateFuzzyMatchScore(name, terms) {
            if (!terms.length) return 0;
            return terms.reduce((totalScore, term) => {
                let termScore = Infinity;
                // This will account for matching any segment of the name that includes the term
                for (let i = 0; i <= name.length - term.length; i++) {
                    const part = name.substring(i, i + term.length);
                    termScore = Math.min(termScore, getLevenshteinDistance(part, term));
                }
                totalScore += (term.length - termScore) / term.length; // Normalize by term length
                return totalScore;
            }, 0) / terms.length;
        }
    
        let filteredPets = allPets.filter(pet => {
            const name = pet.configName.toLowerCase();
            const isNormal = pet.Variant === 'Normal' && normalChecked;
            const isGolden = pet.Variant === 'Golden' && goldenChecked;
            const isRainbow = pet.Variant === 'Rainbow' && rainbowChecked;
            // Show all pets if no input, or filter based on the fuzzy score
            return (searchTerms.length === 0 || calculateFuzzyMatchScore(name, searchTerms) > 0.5) && (isNormal || isGolden || isRainbow);
        });
    
        // Sort the pets based on the fuzzy match score and additional criteria
        filteredPets.sort((a, b) => {
            const nameA = a.configName.toLowerCase();
            const nameB = b.configName.toLowerCase();
            const scoreA = calculateFuzzyMatchScore(nameA, searchTerms);
            const scoreB = calculateFuzzyMatchScore(nameB, searchTerms);
    
            if (scoreA !== scoreB) {
                return scoreB - scoreA;
            }
    
            // Count the occurrences of the search term's first letter in the name for tie-breaking
            const countOccurrences = (name, char) => name.split(char).length - 1;
            const firstChar = searchTerm.charAt(0);
            const occurrencesA = countOccurrences(nameA, firstChar);
            const occurrencesB = countOccurrences(nameB, firstChar);
    
            if (occurrencesA !== occurrencesB) {
                return occurrencesB - occurrencesA;
            }
    
            if (nameA.length !== nameB.length) {
                return nameA.length - nameB.length;
            }
    
            return nameA.localeCompare(nameB);
        });
    
        // Render the filtered and sorted pets
        renderPets(filteredPets);
    }
    
    
    
    
    
    
    
    
    
    
    

    

});


