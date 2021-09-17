import Component from './component'
import LoginComponent from './login.component'
import { validation } from '../utils/utils'

export default class StartComponent extends Component {

	constructor(idSelector) {
		super(idSelector)
	}

	init() {

		this.login = new LoginComponent('login', validation)

		const isVisited = JSON.parse(localStorage.getItem('isVisited'))

		if (isVisited) {
			this.hide()
			afterStart.call(this)
		} else {	

			this.$el.querySelector('.start-btn').addEventListener('click', () => {
				localStorage.setItem('isVisited', true)
				this.hide()
				afterStart.call(this)
			}, {
				once: true
			})

		}

	}

}


function afterStart() {
	this.login.show()
}