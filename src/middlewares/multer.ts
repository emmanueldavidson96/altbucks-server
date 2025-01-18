import multer from "multer";

const storage = multer.diskStorage({
    destination:function(request, file, callback){
        callback(null, "./upload")
    },
    filename:function(request, file, callback){
        callback(null, Date.now()+file.originalname)
    }
})

const upload = multer({
    storage:storage,
    limits:{
        fieldSize:1024*1024*3
    }
})

export default upload
