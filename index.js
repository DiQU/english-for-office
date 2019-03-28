const fsPromises = require('fs').promises

let sections = []

fsPromises.readFile('Input.txt', 'utf8')
    .then(data => {
        sections = sectionlize(data, sectionsKeyword)
        console.log(sections)
    })
    .catch(err => console.log('err: ' + err))

// 找出分區的關鍵字
const sectionsKeyword = [
    '- ?\\d -',
    'A. CONVERSATION',
    'B. WORDS & PHRASES',
    'C. LANGUAGE FOCUS',
    'D. EXERCISES',
    '《Answer Key》'
]

function sectionlize(data, sectionsKeyword) {
    // console.log(data)
    const index = []
    const sections = []

    for (let i = 0; i < sectionsKeyword.length; i++) {
        index[i] = data.search(new RegExp(sectionsKeyword[i]))
        if (i === 0) continue
        sections[i - 1] = data.slice(index[i - 1], index[i])
    }
    sections.push(data.slice(index[index.length - 1], -1))
    return sections
}
