function addToCart(colId){
    $.ajax({
        url:'/add-to-cart?id='+colId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count = $('#cartCount').html()
                count=parseInt(count)+1
                $('#cartCount').html(count)
            }
        }
    })
}

// function changeQty(collId,count){
//     $.ajax({
//         url:'/changeQty?id='+collId+'&count='+count,
//         method:'post',
//         // data:{
//         //     collId:collId,
//         //     count:count
//         // },
        
//         success:(response)=>{
//             //alert(response.qty)
//             console.log("success response"+response)
//             if(response.status){
//                 let countOld = $('#itemcount').html()
//                 countOld=parseInt(countOld)+parseInt(count)
//                 $('#itemcount').html(count)
//             }else{
//                 console.log('NOT FOUND')
//             }
//         }
//     })
// }
