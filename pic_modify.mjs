import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import { exit } from "process";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);


function getFileDir(filename) {
    return filename.substring(0, filename.lastIndexOf("/") + 1);
}

function getFileName(filename) {
    return filename.split('/').pop();
}

function getExtension(filename) {
    return filename.split('.').pop();
}
const getAllFiles = function(dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            let fChar = file.charAt(0)
            if (fChar === '.') {
                // console.log("隐藏文件夹")
                // console.log(file)
                return
            }
            if (file === 'node_modules') {
                return
            }
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            let ext = getExtension(file)
            if (
                ext === "jpg" ||
                ext === "png" ||
                ext === "md" ||
                ext === "jpeg"
            ) {
                // arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
                arrayOfFiles.push(path.join(dirPath, "/", file))
                    // arrayOfFiles.push(file)
            }
        }
    })

    return arrayOfFiles
}
let filesArr = getAllFiles(__dirname)
let filetersMDs = []
let filetersImgDirPICs = []
filesArr.forEach(v => {
    let ext = getExtension(v)
    if (
        ext === "jpg" ||
        ext === "png" ||
        ext === "jpeg"
    ) {

        if (v.indexOf('imgdir') >= 0) {
            filetersImgDirPICs.push(v)
        }
    }
    if (ext === "md") {
        filetersMDs.push(v)
    }
})

// console.log(filesArr.length)
console.log("filetersImgDirPICs:", filetersImgDirPICs.length)
console.log("filetersImgDirPICs[0]:", filetersImgDirPICs[0])
console.log("all MDs:", filetersMDs.length)
    // let picsNeedDelete = []

// 把imgdir --->>> minilet
filetersImgDirPICs.forEach(async m => {
    if (m.indexOf('minilet') >= 0) {
        // 
    } else {
        let PicDir = getFileDir(m)
        let PicReplaceDir = getFileDir(PicDir.substring(0, PicDir.length - 1)) + 'minilet/'
        let PicName = getFileName(m)
        try {
            let statObj = await fs.statSync(PicReplaceDir + PicName)
                // fs.rmdirSync(m);
        } catch (err) {
            console.log(PicReplaceDir + PicName);
            const files = await imagemin(
                [m], // 原文件
                {
                    destination: PicReplaceDir,
                    plugins: [
                        imageminPngquant({
                            quality: [0.6, 0.8]
                        })
                    ]
                });
        }
    }
})

String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

// 替换md中的图片引用 
filetersMDs.forEach(v => {
    let data = fs.readFileSync(v)
    let dataStr = data.toString()
    let flagChange = false
    filetersImgDirPICs.forEach(m => {
        let PicName = "imgdir/" + getFileName(m)
        if (dataStr.indexOf(PicName) >= 0) {
            flagChange = true
            dataStr = dataStr.replaceAll(PicName, "minilet/" + getFileName(m))
        }
    })
    if (flagChange) {
        fs.writeFileSync(v, dataStr, { encoding: 'utf8' }, err => {})
    }
})

let PicUsed = [] // 全文发布时,减轻上传包的大小

let filesPicInMinilet = []
getAllFiles(__dirname, []).forEach(v => {
    if (v.indexOf('minilet') >= 0) {
        let ext = getExtension(v)
        if (
            ext === "jpg" ||
            ext === "png" ||
            ext === "jpeg"
        ) {
            filesPicInMinilet.push(v)
        }
    }
})
console.log("len pic minilet:", filesPicInMinilet.length)
filetersMDs.forEach(v => {
    let data = fs.readFileSync(v)
    let dataStr = data.toString()
    filesPicInMinilet.forEach(m => {
        let PicName = "minilet/" + getFileName(m)
            // console.log(PicName)
        if (dataStr.indexOf(PicName) >= 0) {
            PicUsed.push(m)
        }
    })
})

function getArrDifference(arr1, arr2) {
    return arr1.concat(arr2).filter(function(v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
    });
}

console.log('used:', PicUsed.length)
console.log('used:', PicUsed[0])

function deleteall(path) {
    var files = [];
    if (fs.existsSync(path)) {
        try {
            files = fs.readdirSync(path);
            files.forEach(function(file, index) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    deleteall(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
        } catch {
            fs.unlinkSync(path);
        }
    }
};
let arrDiff = getArrDifference(PicUsed, filesPicInMinilet)
console.log("arrDiff", arrDiff.length)
    // console.log("arrDiff", arrDiff)
console.log("PicUsed[0]:", PicUsed[0])
console.log("filesPicInMinilet[0]:", filesPicInMinilet[0])


if (arrDiff.length) {
    // 删除不需要的文件(minilet文件夹里) 
    arrDiff.forEach(m => {
        deleteall(m)
    })
}
if (filetersImgDirPICs.length) {
    filetersImgDirPICs.forEach(m => {

        if (m.indexOf('minilet') >= 0) {

        } else {
            setTimeout(function() {
                deleteall(m)
            }, 3000)
            console.log('file delete!!!:', m)
                // 删除不需要的文件(imgdir文件夹里) 
        }
    })
}
// console.log('used:', PicUsed)
setTimeout(function() {
    console.log('timeout 3!!!')
    console.log('timeout 3!!!')
    console.log('timeout 3!!!')
    console.log('timeout 3!!!')
}, 3000)

console.log('finish!!!')