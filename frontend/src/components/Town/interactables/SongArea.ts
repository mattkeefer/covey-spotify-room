import SongAreaController from '../../../classes/SongAreaController';
import TownController from '../../../classes/TownController';
import { BoundingBox } from '../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../Interactable';
import TownGameScene from '../TownGameScene';

export default class SongArea extends Interactable {
  private _topicTextOrUndefined?: Phaser.GameObjects.Text;

  private _infoTextBox?: Phaser.GameObjects.Text;

  private _songArea?: SongAreaController;

  private _townController: TownController;

  constructor(scene: TownGameScene) {
    super(scene);
    this._townController = scene.coveyTownController;
    this.setTintFill();
    this.setAlpha(0.3);
    // TODO: add listener to townController
    this._townController.addListener('songAreasChanged', this._updateSongAreas);
  }

  private get _topicText() {
    const ret = this._topicTextOrUndefined;
    if (!ret) {
      throw new Error('Expected topic text to be defined');
    }
    return ret;
  }

  getType(): KnownInteractableTypes {
    return 'songArea';
  }

  removedFromScene(): void {}

  addedToScene(): void {
    super.addedToScene();
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._topicTextOrUndefined = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      '(No Topic)',
      { color: '#000000' },
    );
    this._updateConversationAreas(this._townController.songAreas);
  }

  private _updateConversationAreas(areas: ConversationAreaController[]) {
    const area = areas.find(eachAreaInController => eachAreaInController.id === this.name);
    if (area !== this._songArea) {
      if (area === undefined) {
        this._songArea = undefined;
        this._topicText.text = '(No topic)';
      } else {
        this._songArea = area;
        if (this.isOverlapping) {
          this._scene.moveOurPlayerTo({ interactableID: this.name });
        }
        const updateListener = (newTopic: string | undefined) => {
          if (newTopic) {
            if (this._infoTextBox && this._infoTextBox.visible) {
              this._infoTextBox.setVisible(false);
            }
            this._topicText.text = newTopic;
          } else {
            this._topicText.text = '(No topic)';
          }
        };
        updateListener(area.topic);
        area.addListener('topicChange', updateListener);
      }
    }
  }

  public getBoundingBox(): BoundingBox {
    const { x, y, width, height } = this.getBounds();
    return { x, y, width, height };
  }

  private _showInfoBox() {
    if (!this._infoTextBox) {
      this._infoTextBox = this.scene.add
        .text(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2,
          "You've found an empty conversation area!\nTell others what you'd like to talk about here\nby providing a topic label for the conversation.\nSpecify a topic by pressing the spacebar.",
          { color: '#000000', backgroundColor: '#FFFFFF' },
        )
        .setScrollFactor(0)
        .setDepth(30);
    }
    this._infoTextBox.setVisible(true);
    this._infoTextBox.x = this.scene.scale.width / 2 - this._infoTextBox.width / 2;
  }

  overlap(): void {
    if (this._songArea === undefined) {
      this._showInfoBox();
    }
  }

  overlapExit(): void {
    this._infoTextBox?.setVisible(false);
  }
}
