/*页面载入完成后，创建复制按钮*/
// 添加代码复制botton功能
copy_count=0;
$('figure.highlight.plain .code pre').each(function(){
    var my=$(this);
    var father=$(this).parent('figure')
    my.parent().prev().before("<button style='width:36px' class='btn-cp"+copy_count+"'>Copy</button>");
    var mycount=copy_count;
    copy_count+=1;

    var text=my['context']['innerText'];
    var clipboard = new Clipboard('.btn-cp'+mycount, {
        // 点击copy按钮，直接通过text直接返回复印的内容
            text: function() {
                return text;
            }
    });
    
})
// 保护知识产权
if(document.domain!='localhost'){
    var copyright="";
    // 如果在首页无法找到copyright的话
    if(window.location.protocol + '//' + window.location.host+'/'!=window.document.location.href){
        copyright=$(".copyright")[0]['innerText'];
    } 
    else{
        copyright="文章作者:SaltedMdFiveSh\r\n\r\n作者链接:https://silver-birch-wawa.github.io/\r\n\r\n许可协议: '署名-非商用-相同方式共享 4.0' 转载请保留原文链接及作者。"
    }
    $(document).bind({  
        copy: function(e) {//copy事件 
            var cpTxt =copyright; 
            var clipboardData = window.clipboardData; //for IE  
            if (!clipboardData) { // for chrome  
                clipboardData = e.originalEvent.clipboardData;  
            }
            // console.log("copy success.");
        
            //替换
            var selection = window.getSelection().toString();
            if(selection.length<15){
                clipboardData.setData('Text',selection); 
                return false;
            }
            if(e.clipboardData){
                e.clipboardData.setData('text/plain', selection + copyright);
            }else if(window.clipboardData){
                //ie浏览器
                window.clipboardData.setData('text/plain', selection + copyright);
            } 
            clipboardData.setData('Text',selection+'\r\n\r\n'+copyright);  
            return false;//否则设不生效  
        }
    });
}

/*

$('figure.highlight.plain pre').each(function(){$(this).click(function(){console.log($(this)})})

*/