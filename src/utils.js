function generateRandomShips(field, shipsFleetSettings) {
    const shipFleet = Object.keys(shipsFleetSettings).map((v) => {
        return new Array(shipsFleetSettings[v]).fill(Number(v))
    }).flat().reverse()
    const ships = []
    shipFleet.forEach((length) => {
        let shipPlaced = false;
        let counter = 0
        while (!shipPlaced) {
            if (counter > 100) {
                console.log(counter)
                console.log(field.ships)
                throw new Error("Can't create random field")
            }
            try {
                const randomOrientation = Boolean(getRandomInt(0, 1))
                const shipCoordinates = getRandomShip(length, randomOrientation).join(',')
                field._isShipsIntersect([shipCoordinates, ...ships])
                ships.push(shipCoordinates)
                shipPlaced = true;
            } catch (error) {
                counter++
            }
        }
    });
    return ships
}

getRandomShip = (length, isHorizontal) => {
    const maxX = isHorizontal ? 11 - length : 10;
    const maxY = !isHorizontal ? 11 - length : 10;
    const firstPosition = getRandomInt(0, maxX) + '' + getRandomInt(0, maxY)
    if (length === 1) return [firstPosition]
    const lastPosition = isHorizontal ? `${Number(firstPosition[0]) + length - 1}${firstPosition[1]}` : `${firstPosition[0]}${Number(firstPosition[1]) + length - 1}`
    const cells = new Array()
    cells.push(firstPosition)
    for (let i = 1; i < length - 1; i++) {
        const newCell = isHorizontal ? `${Number(firstPosition[0]) + i}${firstPosition[1]}` : `${firstPosition[0]}${Number(firstPosition[1]) + i}`
        cells.push(newCell)
    }
    cells.push(lastPosition)
    return cells
}

function getRandomInt(min, max) {
    min = Math.floor(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min));
}


module.exports = { generateRandomShips }
