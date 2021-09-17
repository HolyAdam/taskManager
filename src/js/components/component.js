export default class Component {
	constructor(idSelector) {
		this.$el = document.getElementById(idSelector)

		this.init()
	}

	init() {

	}

	onShow() {
		

	}

	onHide() {
		

	}

	show() {
		this.$el.classList.remove('hide')

		this.onShow()
	}

	hide() {
		this.$el.classList.add('hide')

		this.onHide()
	}

}