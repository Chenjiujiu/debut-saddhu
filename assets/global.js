function debounce(fn, wait) {
	let t;
	return (...args) => {
		clearTimeout(t);
		t = setTimeout(() => fn.apply(this, args), wait);
	};
}

class CustomRecommend extends HTMLElement{
	constructor() {
		super();
		this.url = this.dataset.url;
		const handleIntersection = (entries,observe)=>{
			if(!entries[0].isIntersecting) return;
			observe.unobserve(this);
			fetch(this.url)
				.then(res=>res.text())
				.then(res=>{
					const html = document.createElement('div');
					html.innerHTML=res;
					const recommendations = html.querySelector('.custom-recommend');
					if (recommendations && recommendations.innerHTML.trim().length) {
						this.innerHTML = recommendations.innerHTML;
					}
				})
		}
		new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 200px 0px'}).observe(this);
	}
}
customElements.define("custom-recommend",CustomRecommend)

class CustomEval extends HTMLElement{
	constructor() {
		super();
		this.url = 'https://app.ryviu.io/frontend/client/get-reviews-data?domain=usmileofficial.myshopify.com';
		this.id=this.dataset.id||"";
		this.handle=this.dataset.handle ||"";
		this.template = this.querySelector('.slot-eval>li').cloneNode(true);
		this.num = this.dataset.num
		this.init();
	}
	init(){
		const data = {
			"handle": this.handle,
			"product_id":this.id,
			"page": 1,
			"type": "load-more",
			"order": null,
			"filter": "all",
			"feature": false,
			"domain": "usmileofficial.myshopify.com",
			"platform": "shopify"
		}
		fetch('https://app.ryviu.io/frontend/client/get-reviews-data?domain=usmileofficial.myshopify.com', {
			method: 'POST',
			body: JSON.stringify(data)
		})
			.then(res => res.json())
			.then(data=>{
				this.evalData = data;
				this.render();
			}).catch(err=>{
			console.log("评论获取出错",err)})
	}
	render(){
		const data = this.evalData.reviews.slice(0,this.num);
		const fragment=document.createDocumentFragment();
		data.forEach(item=>{
			let newdom = this.template.cloneNode(true);
			if(item.avatar){
				newdom.querySelector('.eval-avatar img').setAttribute('src',item.avatar.replace('SX48',"SX80"));
			}else{
				newdom.querySelector('.eval-avatar').classList.add('txt-avatar');
				newdom.querySelector('.eval-avatar').innerHTML=item.author.slice(0,1).toUpperCase();
			}
			let ratings = newdom.querySelectorAll('.eval-rating>span');
			for (let i = 0; i < item.rating; i++) {
				ratings[i].classList.add('eval-rating-icon-high')
			}
			newdom.querySelector('.eval-auth').innerHTML = "- "+item.author;
			newdom.querySelector('.eval-desc').innerHTML = item.body_text;
			newdom.classList.remove('slot-eval-temp');
			fragment.appendChild(newdom);
		})
		this.querySelector('ul.slot-eval').innerHTML='';
		this.querySelector('.slot-eval').appendChild(fragment)
	}
}
customElements.define("custom-eval",CustomEval)

class SliderScroll extends HTMLElement {
	constructor() {
		super();
		this.id = this.dataset.id;
		this.slider = this.querySelector(`ul[data-id=${this.id}]`);
		this.items = this.slider.querySelectorAll(`li[data-id=${this.id}]`);
		this.current = 0;
		this.prevButton = this.querySelector(`.ctrl-prev[data-id=${this.id}]`) || this.querySelector('.ctrl-prev');
		this.nextButton = this.querySelector(`.ctrl-next[data-id=${this.id}]`) || this.querySelector('.ctrl-next');
		if (!this.slider) return;
		this.init();
		this.bindClick();
		this.bindTouch()
	}
	init(){
		if (document.documentElement.offsetWidth>750){
			this.num = this.dataset.num || 1;
		}else{
			this.num = this.dataset.numM || 1;
		}
		this.max = this.items.length - Number(this.num);
		this.moveStep = 100/this.num;
	}
	bindClick(){
		this.prevButton.addEventListener('click', this.prev.bind(this));
		this.nextButton.addEventListener('click', this.next.bind(this));
		window.addEventListener("resize",debounce(()=>{this.init()},300).bind(this))
	}
	bindTouch() {
		let startX = 0;
		let downX = 0
		let endX = 0;
		this.slider.ontouchstart = (e) => {
			startX = e.changedTouches[0].pageX;
			endX = startX;
			this.slider.ontouchmove = (e) => {
				e.preventDefault()
				endX = e.changedTouches[0].pageX;
			}
			this.slider.ontouchend = (e) => {
				if ((endX - startX) > 10) {
					this.prev();
				} else if ((endX - startX) < -10) {
					this.next();
				}
				this.slider.onmousemove = null;
				this.slider.onmouseup = null;
			}
		}
	}
	prev(){
		this.updateCurrent(-1);
		this.updateButton();
		this.sliderMove();
	}
	next(){
		this.updateCurrent(1);
		this.updateButton();
		this.sliderMove();
	}
	updateCurrent(tag) {
		this.current += tag;
		if (this.current <= 0) {
			this.current = 0
		}
		if (this.current >= this.max) {
			this.current = this.max;
		}
	}
	updateButton() {
		if (this.current === 0) {
			this.prevButton.classList.add('is-disable')
		} else {
			this.prevButton.classList.remove('is-disable')
		}
		if (this.current === this.max) {
			this.nextButton.classList.add('is-disable')
		} else {
			this.nextButton.classList.remove('is-disable')
		}
	}
	sliderMove() {
		this.slider.style = 'transform: translateX(-' + (this.current * this.moveStep) + '%)'
	}
}
customElements.define('slider-scroll', SliderScroll);
