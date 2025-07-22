
function main(files){
    const file_paths = Object.keys(files);
    const project = [
        {
            name:"src",
            content:[]
        }
    ]
    const addfile = (folder , path ,content)=>{
            if(typeof path==='string' && typeof content==='string'){
                const path_array  = path.split('/');
                const name = path_array[0];
                if(path_array.length===1){
                     folder.push({name,content,type:"file"});
                     return;
                }
                let next_folder = folder.find((f)=>f.name===name &&f.type==="folder");
                if(!next_folder) {
                    next_folder ={name,content:[],type:"folder"}
                folder.push(next_folder);
                };
                path_array.shift()
                addfile(next_folder.content,path_array.join('/'),content)
            }
    }
    for (const key of file_paths){
        addfile(project[0].content,key,files[key])
    }
    return project   
}

main();