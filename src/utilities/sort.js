/**
 * ---
 * Order an array of objects based on another array order
 * ---
 */

export const mapOrder = (array, order, key) => {
    if (!array || !order || !key) return []
    array.sort((a, b) => order.indexOf(a[key]) - order.indexOf(b[key]))
    return array
}


/**
 * Example:
 */
// const itemArray = [
//     { id: 1, label: 'One' },
//     { id: 2, label: 'Two' },
//     { id: 3, label: 'Three' },
//     { id: 4, label: 'Four' },
//     { id: 5, label: 'Five' }
// ]
// const itemOrder = [5, 4, 2, 3, 1]

// itemArray.sort((a, b) =>
//     itemOrder.indexOf(a.id) - itemOrder.indexOf(b.id)
// )

//const orderedArray = mapOrder(itemArray, itemOrder, 'id')
//console.log('Ordered array:', orderedArray)
/**
* Results:
*
* Ordered array:
*   [
*  {"id":5,"label":"Five"},
*  {"id":4,"label":"Four"},
*  {"id":2,"label":"Two"},
*  {"id":3,"label":"Three"},
*  {"id":1,"label":"One"}
*  ]
*/