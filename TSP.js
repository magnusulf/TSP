let graph = [
    [0 , 10, 15, 20, 1],
    [10, 0 , 35, -1, 1],
    [15, 35, 0 , 30, 1],
    [20, -1, 30, 0 , 1],
    [1 , 1 , 1 , 1 , 0]
];

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

function getShortestRoute()
{
    let baseArray = [];
    for (let i = 0; i < graph.length; i++)
    {
        baseArray[i] = i;
    }

    let length = 10000000;
    let route = baseArray;

    let permutations = getPermutations(baseArray);
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

console.log(getShortestRoute());
console.log(getDistanceWholeRoute(getShortestRoute()));

