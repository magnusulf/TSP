// Hej Jakob, og evt. censor, undskyld at alle kommentarerne er på engelsk
// Men jeg er så vant til at skrive kode på engelsk, at jeg helt instinktivt brugte engelsk

// The graph
let graph = [
    [0 , 1, 1, 1, 1],
    [1, 0 , 1, 1, 1],
    [1, 1, 0 , 1, 1],
    [1, 1, 1, 0 , 1],
    [1 , 1 , 1 , 1 , 0]
];

const HIGH = 9007199254740992; // The largest integer in javascript

function getBaseArray()
{
    let baseArray = [];
    for (let i = 0; i < graph.length; i++)
    {
        baseArray[i] = i;
    }
    return baseArray;
}

//
//  LOAD FROM WEBSITE
//

document.querySelector("#send").addEventListener("click", loadWeb);

function loadWeb() {

    let by1 = document.querySelector("#by1").value;
    let by2 = document.querySelector("#by2").value;
    let afstand = document.querySelector("#afstand").value;

    // Must be ints
    // Probably should do some checks here
    by1 = parseInt(by1);
    by2 = parseInt(by2);
    afstand = parseInt(afstand);

    // Load onto the graph
    graph[by1][by2] = afstand;

    calculateGraphRoutes(getBaseArray());
    let route = getShortestRouteDynamic();
    let length = getDistanceWholeRoute(route);

    document.querySelector("#resultat").innerHTML = "Graf: " + JSON.stringify(graph) + "<br> Rute: " + JSON.stringify(route) + "<br>Længde: " + length;
}


//
//  CALCULATE DISTANCES
//

function getDistanceBetween(from, to)
{
    return graph[from][to];
}

function getDistanceSubRoute(cities)
{
    let totalDistance = 0;
    let i = 0;
    for (;;)
    {
        let city = cities[i];
        let nextCity = cities[++i];
        if (nextCity === undefined) break;

        let distance = getDistanceBetween(city, nextCity);
        if (distance < 0) return null;
        totalDistance += distance;
    }
    return totalDistance;
}

function getDistanceWholeRoute(cities)
{
    // There must be at least one occurence of all cities
    for (let i = 0; i < graph.length; i++)
    {
        let occurences = cities.filter(city => city === i).length;
        if (occurences !== 1) throw new  Error();
    }

    // Calculate new route with start city readded at the end
    let startCity = cities[0];
    let newRoute = cities.slice();
    newRoute[newRoute.length] = startCity;

    return getDistanceSubRoute(newRoute);
}

//
//  BRUTE FORCE METHOD
//

// This method returns an array of arrays
function getPermutations(array)
{
    if (array.length === 0) return [];
    if (array.length === 1) return [array.slice()];

    let ret = [];

    for (let i = 0; i < array.length; i++)
    {
        // Get element (will be the first in this permutation)
        let element = array[i];

        // Get the rest of the array
        let restOfArray = arrayWithoutElementAtIndex(array, i);

        // And the possible permutations it has
        let permutations = getPermutations(restOfArray);

        // Combine those and add them to the return
        for (let j = 0; j < permutations.length; j++)
        {
            let permutation = permutations[j];
            permutation.unshift(element);
            ret[ret.length] = permutation;
        }
    }

    return ret;
}

function arrayWithoutElementAtIndex  (arr, index)
{
    return arr.filter(function(value, arrIndex) {
        return index !== arrIndex;
    });
}

// this function makes use of brute-force
// So it is not efficient and it is just used to compare results
// with the faster solution
// I am more certain this one works, although it might not work on larger graphs.
function getShortestRouteBruteForce()
{
    let baseArray = [];
    for (let i = 0; i < graph.length; i++)
    {
        baseArray[i] = i;
    }

    let length = HIGH;
    let route = baseArray;

    let permutations = [];
    let tempPermutations = getPermutations([1,2,3,4]);

    // Combine those and add them to the return
    for (let j = 0; j < tempPermutations.length; j++)
    {
        let permutation = tempPermutations[j];
        permutation.unshift(0);
        permutations[permutations.length] = permutation;
    }

    for (let i = 0; i < permutations.length; i++)
    {
        let permutation = permutations[i];
        let l = getDistanceWholeRoute(permutation);
        if (l === null) continue;
        if (l > length) continue;

        length = l;
        route = permutation;
    }

    return route;
}

//
//  DYNAMIC METHOD
//

// This javascript object is used like a hashtable
// It stores the optimal route for different sets and different endings
let map = {};

// This one creates a unique string for each array (set) and ending
function getKey(arr, i)
{
    if (arr.indexOf(0) !== 0) throw new Error(); // Assertion - should not happen
    if (arr.indexOf(i) < 0) throw new Error(); // Assertion - should not happen
    return "" + arr + " : " + i;
}

function getVal(arr, i)
{
    // The key is gotten here, so the assertions are performed
    var key = getKey(arr, i);

    // For graphs with just two vertices there is only one solution
    // Also because this solution is recursive (solutions for sets sized n, are based on solutions for sets sized n-1)
    // This serves as the end point.
    if (arr.length === 2) return [0, i];
    return map[key];
}

function setVal(arr, i, value)
{
    map[getKey(arr, i)] = value;
}

// Gets solutions for all vertices and all possible end cities
// and returns the one that has the shortest overall route
function getShortestRouteDynamic()
{
    // Get the base array
    let baseArray = getBaseArray();

    let minLength = HIGH;
    let minRoute = undefined;

    for (let i = 1; i < graph.length; i++)
    {
        let route = getVal(baseArray, i);
        let length = getDistanceWholeRoute(route);

        if (length > minLength) continue;
        minLength = length;
        minRoute = route;
    }

    return minRoute;
}

function calculateGraphRoutes(arr)
{
    // Loops through all possible set sizes
    // Starts at 2, because a route can't be made between 0 or 1 city.
    // And starts with the lower set sizes because the larger set sizes are based on those.
    for (let subsetSize = 2; subsetSize <= arr.length; subsetSize++)
    {
        calcSubsetsOfSize(arr, subsetSize);
    }
}

function calcSubsetsOfSize(arr, subsetSize)
{
    // Get all the subsets with a specific size.
    let subsets = getAllSubsetsOfSize(arr, subsetSize);

    // They must also all start at 0
    subsets = subsets.filter(set => set.indexOf(0) >= 0);

    subsets.forEach(subset => calcForSubset(subset));
}

// This one calculates and stores all the optimal routes
// That start in 0 and ends in each of the elements in the array
function calcForSubset(subset)
{
    for (let counter1 = 0; counter1 < subset.length; counter1++)
    {
        // Consider the options where the route end in j
        let j = subset[counter1];

        if (j === 0) continue; // Since we start at 0, we can't also end there

        // Get the set without the city j, so to find the shortest route there
        let newSubset = subset.filter(element => element !== j);


        // And now find the solutions that starts in 0 goes through the new set (without j)
        // then goes to i and then to j
        // And choose the one with the lowest value

        let minLength = HIGH;
        let minRoute = undefined;

        for (let counter2 = 0; counter2 < newSubset.length; counter2++)
        {
            let i = newSubset[counter2];
            if (i === 0) continue;

            // Get the route from 0 to i that goes through all the cities
            let route = getVal(newSubset, i);
            let newRoute = route.slice();
            newRoute[newRoute.length] = j; // And add j to the new route

            // And store this route if it is the shortest
            let length = getDistanceSubRoute(newRoute);
            if (length > minLength) continue;
            minLength = length;
            minRoute = newRoute;
        }
        //let minLength = newSubset.map(i => getVal(newSubset, i) + getDistanceBetween(i,j))
        //  .reduce((a,b) => Math.min(a,b), HIGH);
        setVal(subset, j, minRoute);
    }
}

// Gotten from stackoverflow
// https://stackoverflow.com/questions/42773836/how-to-find-all-subsets-of-a-set-in-javascript
function getAllSubsetsOfSize(arr, size)
{
    return arr.reduce(
        (subsets, value) => subsets.concat(
            subsets.map(set => [...set,value])
        ),
        [[]]
    ).filter(a => a.length == size);
}
