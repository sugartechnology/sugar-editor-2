import { Command } from '../Command';

class AddSugarModelCommand extends Command {

	constructor( editor, sugarModel ) {

		super( editor );

		this.type = 'AddSugarModelCommand';

		this.name = 'Add Sugar Model';

		this.sugarModel = sugarModel;

		if ( sugarModel !== null ) {

			this.name = editor.strings.getKey( 'command/AddSugarModel' ) + ': ' + sugarModel.data.id;

		}

	}

	execute() {

		this.sugarModel.model.userData.rootRef = () => this.sugarModel;
		this.editor.addSugarModel( this.sugarModel );
		this.editor.select( this.sugarModel.model );
		this.editor.signals.sugarModelAdded.dispatch( this.sugarModel.model );

	}

	undo() {

		this.editor.removeSugarModel( this.sugarModel );
		this.editor.deselect();

	}

	toJSON() {

		const output = super.toJSON( this );

		output.sugarModel = this.sugarModel.toJSON();

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.sugarModel = json.sugarModel;

	}

}

export { AddSugarModelCommand };
