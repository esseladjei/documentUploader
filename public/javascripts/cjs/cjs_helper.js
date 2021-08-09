(function ($) {
    function hideElementBasedOnDocumentType(type){
        showAll();
        switch (type) {
            case 'image':
                hideFileFormats();
                hideVideoFormats();
                $('#zlabfile').attr('accept','image/*')
                break;
            case 'video':
                hideImageItems();
                hideFileFormats();
                $('#zlabfile').attr('accept','video/*')
                break;
            case 'file':
                hideImageItems();
                hideVideoFormats();
                hideResolutions();
                $('#zlabfile').attr('accept','application/*')
                break;
            default:
                showAll();
                break;
        }
    }
    function hideFileFormats(){
        $('#fileformats').hide();
        $('#select_fileformats').prop('disabled', true);
    }
    function hideVideoFormats(){
        $('#videoformats').hide();
        $('#select_videoformat').prop('disabled', true);
    }
    function hideResolutions(){
        $('#resolutions').hide();
        $('#select_resolution').prop('disabled', true);
    }
    function hideImageItems(){
        $('#imageformats').hide();
        $('#imagefeature').hide();
        $('#select_imageformats').prop('disabled', true)
        $('#select_imagefeature').prop('disabled', true)
    }
    function showAll (){
        $('#imageformats').show();
        $('#imagefeature').show();
        $('#resolutions').show();
        $('#videoformats').show();
        $('#fileformats').show();

        $('#select_imageformats').prop('disabled', false);
        $('#select_imagefeature').prop('disabled', false);
        $('#select_resolution').prop('disabled', false);
        $('#select_videoformat').prop('disabled', false);
        $('#select_fileformats').prop('disabled', false);
    }
    function initDataTable() {
        var colors=[
            {id:'', name:'All Items'},
            {id:'#C24641',name:'Cherry Red'},
            {id:'#1569C7', name:'Blue Eyes'},
            {id:'#2E8B57', name:'Sea Green'},
            {id:'#FF4500',name:'Orange Red'},
            {id:'#FF69B4',name:'Hot Pink'}
        ]
        $('#jsGrid').jsGrid({
            width: "100%",
            height: "auto",
            filtering: true,
            inserting: false,
            editing: false,
            sorting: true,
            paging: true,
            autoload: true,
            pageSize: 10,
            pageButtonCount: 5,
            noDataContent: "No Record Found",
            loadMessage: "Please, wait...",
            controller: {
                loadData: function(filter) {
                    $
                    return $.ajax({
                        type: "GET",
                        url: "/getalldocuments",
                        data: filter
                    });
                },
            },
            fields: [
                { name: "_id", title:"ID", type: "text", "visible":false},
                { name: "documentname",title:"Document Name", type: "text",  },
                { name: "department",title:"Department", type: "text" },
                { name: "documenttype",title:"Type", type: "text", width:'100px'},
                { name: "imageformats", title:"Img. Formats",width:'80px', type: 'text',filtering: false },
                { name: "imagefeatures",title:"Img. Features",width:'80px', type: "text",filtering: false},
                { name: "videoformat",title:"Video Formats",width:'80px', type: 'text',filtering: false },
                { name: "resolutions",title:"Resolution",width:'80px', type: "text",filtering: false },
                { name: "fileformats",title:"File Formats", type: "text", filtering: false },
                { name: "filesize", title:"File Size", type: "text",filtering: false},
                { name: "mimetype", title:"Mime Type", type: "text",filtering: false},
                { name: "tagging", title:"Tags", type: 'select',items: colors, valueField: "id", textField: "name",
                itemTemplate:function(value, item){
                        let tagColor = []
                        value.forEach(element => {
                            tagColor.push('<span style="color:#FFF;border-radius: 50%;margin-left: 4px;width:15px;height:15px;display:inline-block;background-color:' + element + '"></span>');
                        });
                        tagColor = tagColor.join("");
                        return tagColor
                    }
                 },
                { name: "addedOn",title:"Added On", type: "text" },
                { type: "myControl" ,itemTemplate:function(value,item){
                 var container=$("<div/>")
                    var btnPreview = $('<a  class="dt-preview" title="View file" data-target="#previewModal" data-toggle="modal" data-file="'+ encodeURIComponent(JSON.stringify(item)) +'" style="margin-right:16px;color:#00BCD4" >'+
                    '<i class="fa fa-eye fa-1x"></i></a>');

                    var btnEdit=$('<a  class="dt-edit" title="Edit file" data-target="#editModal"  data-toggle="modal"  data-file="'+ encodeURIComponent(JSON.stringify(item)) +'" style="margin-right:16px;color:#3F51B5">'+
                    '<i class="fa fa-upload" aria-hidden="true"></i></a>');

                    var btnDelete=$('<a class="dt-delete" title="Remove file" data-file="'+ encodeURIComponent(JSON.stringify(item)) +'"style="margin-right:16px;color:#E91E63">'+
                    '<i class="fa fa-trash fa-1x"></i></a>')
                   return container.append(btnPreview).append(btnEdit).append(btnDelete);
                }
            }
            ],
    
        });
    }
    function clearform(){
        $(window).bind('pageshow', function (e) {
             $('form').trigger("reset");;
        });
    }
    function preview(fileData){
        $('.previewbody').empty()
        switch (fileData.documenttype) {
            case 'file':
                $('.previewbody').append(
                    '<div class="preview-container">'+
                    '<iframe src="'+ fileData.filepath +'" width="100%" height="600px"/>'+
                    '</div>')
                break;
             case 'video':
                    $('.previewbody').append(
                        '<div class="preview-container video">'+
                        '<video id="myplayer" class="img-fluid" autoplay muted controls width="100%" height="600px">'+
                        '<source src="'+ fileData.filepath+'" alt="'+ fileData.documentname +'" type="'+ fileData.mimetype +'">'+
                        '</video/>'+
                       '</div>')
                       break;
            default:
                    $('.previewbody').append(
                        '<div class="preview-container" style="text-align:center">'+
                        '<img class="img-fluid" src="'+ fileData.filepath+'" alt="'+ fileData.documentname +'" width="100%" height="400px" />'+
                       '</div>')
                break;
        }
    }
    function editFileData(fileData){
        let type=fileData.documenttype;
        $("#select_department").val(fileData.department);
        $("#select_documenttype").val(fileData.documenttype);
        $("input[name='documentname']").val(fileData.documentname);
        $("input[name='documentID']").val(fileData._id);
        $('#existingfile').text(fileData.filepath)
        switch (type) {
            case 'file':
                hideElementBasedOnDocumentType(type);
                $("#select_fileformats").val(fileData.fileformats);
                $("input[name='tagging']").each(function(){
                    $(this).prop('checked',($.inArray($(this).val(),fileData.tagging) != -1));
                });
                break;
             case 'video': 
               $("#select_videoformat").val(fileData.videoformat);
               $("#select_resolution").val(fileData.resolutions);
               $("input[name='tagging']").each(function(){
                $(this).prop('checked',($.inArray($(this).val(),fileData.tagging) != -1));
                });
                hideElementBasedOnDocumentType(type);
                break;
            case 'image':
                $("#select_imageformats").val(fileData.imageformats);
                $("#select_imagefeature").val(fileData.imagefeature);
                $("#select_resolution").val(fileData.resolutions);
                $("input[name='tagging']").each(function(){
                    $(this).prop('checked',($.inArray($(this).val(),fileData.tagging) != -1));
                });
                hideElementBasedOnDocumentType(type)    
                break;
        }
    }
    function successAlert(heading, message){
        $('.notification').empty().append('<div class="alert alert-success" role="alert">'+
        '<h4 class="alert-heading">'+  heading +'</h4>'+
        '<p>'+ message +'</p>'+
        '<hr>'+
        '<p class="mb-0">Z-Lab Alert</p>'+
      '</div>')
      setTimeout(function(){ 
        $('.notification').fadeOut('slow').empty();
       }, 3000);
    }
    function failureAlert(heading,message){
        $('.notification').empty().append('<div class="alert alert-danger" role="alert">'+
        '<h4 class="alert-heading">'+  heading +'</h4>'+
        '<p>'+ message +'</p>'+
        '<hr>'+
        '<p class="mb-0">Z-Lab Alert</p>'+
      '</div>');
      setTimeout(function(){ 
        $('.notification .alert').fadeOut('slow').empty();
       }, 3000);
    }
    function setAllowedFormats(type){
        $('#zlabfile').attr('accept',type)
    }
    function validate(){
        var tags=$('input[name="tagging"]:checked');
       if(tags.length <= 0 ){
           return false
       }
       return true
    }
    $('#documenttype').change(function(){
        var type=$(this).find(":selected").val();
        hideElementBasedOnDocumentType(type);
    });
    $('#zlabfile').on('change',function(){
        //get the file name
        var fileName = $(this).val();
        //replace the "Choose a file" label
        $(this).next('.custom-file-label').html(fileName);
    });
    $('#frmdocumentItems').trigger("reset");
    $('body').on('click','.dt-preview', function(){
        $('.preview-container').remove();
        var fileData=$(this).data('file');
        fileData= decodeURIComponent(fileData ) 
        fileData= JSON.parse( fileData)
        preview(fileData)
    });
    $('body').on('click', '.dt-edit',function(){
        var fileData=$(this).data('file');
        fileData= decodeURIComponent(fileData ) 
        fileData= JSON.parse( fileData)
        editFileData(fileData)
    });
    $('.previewclose').click(function(){
       $('#myplayer').attr('src', '');
    });
    $('body').on('click', '.dt-delete', function(){
        var fileData=$(this).data('file');
        fileData= decodeURIComponent(fileData ) 
        fileData= JSON.parse( fileData)
        $.ajax({
            url:'/deletedocument?id='+ fileData._id,
            method:'DELETE',
            success:function(){
                $('#jsGrid').jsGrid("render")
                successAlert('Delete success!', 'Document has successfully been delete')
            },
            error:function(){
                failureAlert('Delete Failed!', 'Document delete failed')
            }
        })
    })
    $('form#frmdocumentItems').on('submit',function(e){
        e.preventDefault()
        if(validate()){
        var form = document.forms.namedItem("frmdocumentItems");
        var formData = new FormData(form);
        $.ajax({
            url: '/updatedocument',  
            type: 'PUT',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success:function(data){
              $('#editModal').modal('toggle');
              $('#jsGrid').jsGrid("render")
              successAlert('Updated success!', 'Document has successfully been updated')
            },
            error:function(){
                failureAlert('Updated Failed!', 'Document updated failed')
            }
        });
        }else{
            failureAlert('Validation error','File tag not set. Please check and set file tag')
        }
    });
    $('#select_fileformats').change(function(){
        let type='application/'
        type+=$(this).val();
        setAllowedFormats(type);
    });
    $('#select_imageformats').change(function(){
        let type='image/'
        type+=$(this).val();
        setAllowedFormats(type);
    });
    $('#select_videoformat').change(function(){
        let type='video/'
        type+=$(this).val();
        setAllowedFormats(type);
    })
    clearform();
    initDataTable();
})(jQuery)
