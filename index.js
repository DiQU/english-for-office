// 避免'未宣告變數'汙染global
'use strict'
const fsPromises = require('fs').promises
const audioSources = require('./audioSources')

let sections = []
let title = []
let output = []
let conversation = []
let words = []
let focus = []

fsPromises
    .readFile('Input.txt', 'utf8')
    .then(data => {
        console.log('讀入 input.txt 成功:')
        sections = sectionlize(data.trim(), sectionsKeyword)
        title = handleTitle(sections[0])
        renderTitle()
        renderAudio()
        conversation = handleConversation(sections[1])
        renderConversation()
        words = handleWords(sections[2])
        renderWords()
        focus = handleFocus(sections[3])
        renderFocus()
        renderExercises(sections[4])
        renderAnswer(sections[5])

        let wFilename = 'unit' + title[1]
        return fsPromises.writeFile(
            './units/' + wFilename + '.md',
            output.join(''),
            'utf8'
        )
    })
    .then(function () {
        console.log('寫入 uint.md 成功')
        return fsPromises.readFile('SUMMARY.md', 'utf8')
    })
    .then(data => {
        console.log('讀入 SUMMARY.md 成功:', data)
        let newItem = `* [unit${title[1]}:${title[2]}](./units/unit${title[1]}.md)`
        let Items = data.trim().split(/\r\n|\n/)
        let exist = false
        for (item of Items) {
            if (item === newItem) {
                exist = true
                break
            }
        }
        let newdata = ''
        if (exist) newdata = data.trim()
        else newdata = data.trim() + '\r\n' + newItem

        return fsPromises.writeFile('SUMMARY.md', data, 'utf8')
    })
    .then(() => console.log('寫入 SUMMARY.md 成功'))
    .catch(err => console.log('某個地方出錯了: ' + err))

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
    sections.push(data.slice(index[index.length - 1]))
    return sections
}

// 處理 title 區域
function handleTitle(data) {
    // 1.(第幾單元) 2.(標題名稱)
    let regexp = /- ?(\d+) -(?:\r\n|\n)(.+)/
    const title = data.match(regexp)
    return title
}

// 處理 CONVERSATION 區域
function handleConversation(data) {
    let regexp = /(?:M|W):\s.*/g
    const result = data.match(regexp)
    return result
}

function handleWords(data) {
    // e.g. 'aaa','aaa aaa','aaa-aaa'
    // e.g. 'a aa aaa',片語空格或連字1個以上
    // 單字
    // let regexp1 = /(\w+[-\s’])+/g
    // 發音
    // 片語可能沒發音 數量選擇 '?'
    // let regexp2 = /\[.+\]/g
    // 翻譯
    // let regexp3 = /\(.+/g
    const result = []
    // flags 'g' 可將lastIndex往後調整，不然使用while會無限匹配第一個
    let regexp = /\d+\. ?((?:\w+[- ’])+)(\[.+\])? ?(\(.+)/g
    let i
    while ((i = regexp.exec(data)) !== null) {
        result.push(i)
    }
    return result
}

function handleFocus(data) {
    let result = []

    // 先將分類的index找出來
    let regexp = /《.+》/g
    let sectionIndex = []
    let item = []
    while ((item = regexp.exec(data)) !== null) {
        sectionIndex.push(item.index)
    }

    // 取出的分別的內容
    sectionIndex.unshift(0)
    let a = []
    let sections = []
    for (let i = 0; i < sectionIndex.length; i++) {
        if (i === sectionIndex.length - 1) {
            sections.push(data.slice(sectionIndex[i]))
        } else sections.push(data.slice(sectionIndex[i], sectionIndex[i + 1]))

        // 處理各自的內容
        a = sections[i].trim().split(/\r\n|\n/g)
        // ## 段落
        if (i === 0) {
            for (let k = 0; k < a.length; k++) {
                if (k === 0) a[k] = '## ' + a[k]
                else a[k] = '> ### ' + a[k]
            }
            // #### 段落
        } else {
            for (let j = 0; j < a.length; j++) {
                if (j === 0) a[j] = '#### ' + a[j]
                else a[j] = a[j].replace(/(?:\d+)?\.\s?(.+)/, '$1')
            }
        }
        result.push(a)
    }
    return result
}

function renderTitle() {
    let data = `Uint${title[1]}:${title[2]}`
    let markdown = `# ${data}\n\n`
    output.push(markdown)
}

function renderAudio() {
    let unit = `unit${title[1]}`
    let url = audioSources[unit]
    let data = `<audio controls preload="none"><source src="${url}"></audio>`
    let markdown = `${data}\n\n`
    output.push(markdown)
}

function renderConversation() {
    let data = []
    for (let i = 0; i < conversation.length; i++) {
        data[i] = `* ${conversation[i]}`
    }
    let markdown = `## ${sectionsKeyword[1]}\n${data.join('\n')}\n\n`
    output.push(markdown)
}

function renderWords() {
    let data = []

    for (let i = 0; i < words.length; i++) {
        data[i] = words[i].slice(1).join('|')
    }
    let table = `單字 vocabulary|發音 pronunciation|翻譯 translation\n---|---|---\n${data.join(
        '\n'
    )}`
    let markdown = `## ${sectionsKeyword[2]}\n${table}\n\n`
    output.push(markdown)
}

function renderFocus() {
    let data = []
    for (let i = 0; i < focus.length; i++) {
        if (i === 0) data[i] = focus[i].join('\n')
        else data[i] = focus[i].join('\n1. ')
    }
    let markdown = data.join('\n\n')
    output.push(markdown)
}

function renderExercises(data) {
    let elements = data.trim().split(/\n|\r\n/)
    elements = elements.map((elem, i) => {
        if (i === 0) return elem
        elem = '* ' + elem
        return elem
    })
    let markdown = `\n\n## ${elements.shift()}\n${elements.join('\n')}\n\n`
    output.push(markdown)
}

function renderAnswer(data) {
    let regexp = /(《.+》.+)/
    let item = data.split(/\r\n|\n/).shift()
    let markdown = item.replace(regexp, '`$1`')

    output.push(markdown)
}
