export default class toArray {

	static giveMeArray(obj = {}) {

		if (obj) {
			const arr = []
			for (const key in obj) {
				obj[key]['id'] = key
				arr.push(obj[key])
			}	

			return arr
		}

	}

}