const fsPromises = require('fs').promises

let sections = []
let title = []
let output = []

fsPromises
    .readFile('Input.txt', 'utf8')
    .then(data => {
        console.log('讀入 input.txt 成功:')
        sections = sectionlize(data.trim(), sectionsKeyword)
        title = handleTitle(sections[0])
        let wFilename = 'unit' + title[1]
        output.push(wFilename + ':' + title[2])
        return fsPromises.writeFile('./units/' + wFilename + '.md', sections, 'utf8')
    })
    .then(() => {
        console.log('寫入 uint.md 成功')
        return fsPromises.readFile('SUMMARY.md', 'utf8')
    })
    .then(data => {
        console.log('讀入 SUMMARY.md 成功:', data)
        let link = `[unit${title[1]}:${title[2]}](./units/unit${title[1]}.md)`
        let newdata = data.trim() + '\r\n* ' + link
        return fsPromises.writeFile('SUMMARY.md', newdata, 'utf8')
    })
    .then(() => console.log('寫入 SUMMARY.md 成功'))
    .catch(err => console.log('err: ' + err))

// 找出分區的關鍵字
const sectionsKeyword = [
    '- ?\\d+ -',
    'A. CONVERSATION',
    'B. WORDS & PHRASES',
    'C. LANGUAGE FOCUS',
    'D. EXERCISES',
    '《Answer Key》'
]

// 將文章分類
function sectionlize(data, sectionsKeyword) {
    // console.log(data)
    const index = []
    const sections = []

    for (let i = 0; i < sectionsKeyword.length; i++) {
        index[i] = data.search(new RegExp(sectionsKeyword[i]))
        if (i === 0) continue
        sections[i - 1] = data.slice(index[i - 1], index[i])
    }
    // 加上'最後取得的 index' 到'檔案結束'那一段
    sections.push(data.slice(index[index.length - 1], -1))
    return sections
}

// 處理 title 區域
function handleTitle(data) {
    // 1.(第幾單元) 2.(標題名稱)
    let regexp = /- ?(\d+) -(?:\r\n|\n)(.+)/
    const title = regexp.exec(data)
    return title
}