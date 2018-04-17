<template>
	<div class="hello">
		<input type="file" accept="image/png,image/gif,image/jpeg" @change="myFileOnChange" />

		
	</div>
</template>

<script>
	export default {
		name: 'HelloWorld',
		data() {
			return {
				
			}
		},
		mounted() {

		},
		methods: {
			myFileOnChange: function (e) {   // 这里是你的input  file  的onchange事件
        const file = e.srcElement.files[0]   // 获取到你选择的图片
        const imgURL = window.URL.createObjectURL(file)    // 保存你选择图片的本地路径
        // 一般咱们选择图片后会先让图片在img标签里显示一下，这里你可以先用这个路径，没有问题
        // 本地路径只有在你的电脑上才可以显示，这一步就是当你选择图片的时候先显示在你的img标签里
        // let file = e.target.files[0];
        let d = new Date()
        let type = file.name.split('.')
        this.tokenParem = {
          'putPolicy': '{\'name\':\'$(fname)\',\'size\':\'$(fsize)\',\'w\':\'$(imageInfo.width)\',\'h\':\'$(imageInfo.height)\',\'hash\':\'$(etag)\'}',
          'key': 'orderReview/' + d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.valueOf() + '.' + type[type.length - 1],
          'bucket': 'http://p52ohxg2s.bkt.clouddn.com'// 七牛的地址，这个是你自己配置的（变量）你要上传到的七牛地址
        }
        this.param = new FormData() // 创建form对象
        this.param.append('chunk', '0')// 断点传输
        this.param.append('chunks', '1')
        this.param.append('file', file, file.name)
        // console.log(this.param.get('file')) // FormData私有类对象，访问不到，可以通过get判断值是否传进去
        // let config = {
        //   headers: {'Content-Type': 'multipart/form-data'}
        // }
      // 先从自己的服务端拿到token // 这里的路径是你获取七牛token的请求路径)
        this.$http.get('http://192.168.5.17:8088/upRelated/getQiniuToken').then(result => {
          this.qiniutoken = result.data.response.data   // 在data里定义qiniutoken
               console.log(result)
               console.log(result.data.response.data)
          this.param.append('token', this.qiniutoken)
          this.uploading(this.param, file.name)// 然后将参数上传七牛，这里的uploading事件需要定义在data里，
          
        })
      },
      
      
      uploading: function (param, config, pathName) {   // 定义在data里的uploading函数
          this.$http.get('http://upload.qiniu.com/', param)
          .then(response => {
            console.log(response.body.key)  // 这个key是你上传图片成功后七牛返回给你的图片key
            var key = response.body.key
            this.myHeadImg = 'http:' + key   // 然后这里做一下路径的字符串拼接    前面的路径是你七牛的地址
            // 现在已经获取到你选择图片的路径，相当于一个网络路径，你就可以进行你的先一步操作了。
          })
        }

		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>