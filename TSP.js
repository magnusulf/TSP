let graph = [
    [0 , 10, 15, 20, 1],
    [10, 0 , 35, 10, 1],
    [15, 35, 0 , 30, 1],
    [20, 10, 30, 0 , 1],
    [1 , 1 , 1 , 1 , 0]
];

const HIGH = 100000000000;

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

let map = {};

function getKey(arr, i)
{
    if (arr.indexOf(0) < 0) throw new Error();
    if (arr.indexOf(i) < 0) throw new Error();
    return "" + arr + " : " + i;
}

function getVal(arr, i)
{
    var key = getKey(arr, i);
    if (arr.length === 2) return [0, i];
    return map[key];
}

function setVal(arr, i, value)
{
    map[getKey(arr, i)] = value;
}

// 0 is an implicit member of arr
function C(arr)
{
    arr = [0,1,2,3,4];
    setVal([0], 0, [0]);

    for (let subsetSize = 2; subsetSize <= arr.length; subsetSize++)
    {
        calcSubsetsOfSize(arr, subsetSize);
    }
    console.log(map);
    /*let minLength = HIGH;

    for (let k = 0; k < arr.length; k++)
    {
        let i = arr[k];

        // Remove i, because that is an implicit member
        let newArray = arrayWithoutElementAtIndex(arr, k);

        let dist = C(newArray, i) + getDistanceBetween(i, j);
        if (minLength < dist) continue;
        minLength = dist;
    }
    return minLength;*/
}

function calcSubsetsOfSize(arr, subsetSize)
{
    // Get all the subsets of a specific size
    let subsets = getAllSubsetsOfSize(arr, subsetSize);
    subsets = subsets.filter(set => set.indexOf(0) >= 0); // Must contain 0

    for (let counter1 = 0; counter1 < subsets.length; counter1++)
    {
        let subset = subsets[counter1];
        calcForSubset(subset);
    }
}

function calcForSubset(subset)
{
    //setVal(subset, 0, []); // There is no going from this subset to point 0

    for (let counter1 = 0; counter1 < subset.length; counter1++)
    {
        let j = subset[counter1]; // j is just one option from the subset


        if (j === 0) continue;
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

            console.log("newSubset: " + newSubset + " i: " + i);

            let route = getVal(newSubset, i);
            console.log("route: " + route);
            let newRoute = route.slice();
            newRoute[newRoute.length] = j;

            let length = getDistanceSubRoute(newRoute);
            if (length > minLength) continue;
            minLength = length;
            minRoute = newRoute;
        }
        //let minLength = newSubset.map(i => getVal(newSubset, i) + getDistanceBetween(i,j))
          //  .reduce((a,b) => Math.min(a,b), HIGH);
        console.log("subset: " + subset + " j: " + j + " minRoute: " + minRoute)
        setVal(subset, j, minRoute);
    }
}


function getAllSubsetsOfSize(arr, size)
{

    return arr.reduce(
            (subsets, value) => subsets.concat(
                subsets.map(set => [...set,value])
            ),
            [[]]
        ).filter(a => a.length == size);
}

C(undefined);

console.log(getShortestRoute());
console.log(getDistanceWholeRoute(getShortestRoute()));

