import Config       from '../Config/Config';
import BodyStatus   from './Constants/BodyStatus';
import ScrollStatus from './Constants/ScrollStatus';
import Group        from  './Group';
import Option       from './Option';

const {assign} = Object;

class State {
    public groups:        Group[]      = [];
    public focusedIndex:  number       = -1;
    public selectedIndex: number       = -1;
    public optionHeight:  number       = -1;
    public name:          string       = '';
    public placeholder:   string       = 'Select';
    public scrollStatus:  ScrollStatus = ScrollStatus.AT_TOP;
    public bodyStatus:    BodyStatus   = BodyStatus.CLOSED;
    public isDisabled:    boolean      = false;
    public isInvalid:     boolean      = false;
    public isFocused:     boolean      = false;

    private config: Config;

    constructor(stateRaw: any = null, config = new Config()) {
        this.config = config;

        if (!stateRaw) return;

        assign(this, stateRaw);

        this.groups = this.groups.map((groupRaw) => {
            const group = assign(new Group(), groupRaw);

            group.options = group.options.map(optionRaw => assign(new Option(), optionRaw));

            return group;
        });
    }

    public get totalGroups(): number {
        return this.groups.length;
    }

    public get lastGroup(): Group {
        return this.groups[this.groups.length - 1];
    }

    public get totalOptions(): number {
        return this.groups.reduce((total: number, group: Group) => total + group.totalOptions, 0);
    }

    public get selectedOption(): Option {
        return this.getOptionFromIndex(this.selectedIndex);
    }

    public get focusedOption(): Option {
        return this.getOptionFromIndex(this.focusedIndex);
    }

    public get value(): string {
        return this.selectedOption ? this.selectedOption.value : '';
    }

    public get humanReadableValue(): string {
        if (
            !this.hasValue ||
            (
                this.config.behavior.showPlaceholderOnOpen &&
                this.hasPlaceholder &&
                this.isOpen
            )
        ) {
            return this.placeholder;
        }

        return this.label;
    }

    public get label(): string {
        return this.selectedOption ? this.selectedOption.label : '';
    }

    public get hasPlaceholder(): boolean {
        return this.placeholder !== '';
    }

    public get hasValue(): boolean {
        return this.value !== '';
    }

    public get isGrouped(): boolean {
        return Boolean(this.groups.find(group => group.hasLabel));
    }

    public get isOpen(): boolean {
        return this.bodyStatus !== BodyStatus.CLOSED;
    }

    public get isClosed(): boolean {
        return this.bodyStatus === BodyStatus.CLOSED;
    }

    public get isOpenAbove(): boolean {
        return this.bodyStatus === BodyStatus.OPEN_ABOVE;
    }

    public get isOpenBelow(): boolean {
        return this.bodyStatus === BodyStatus.OPEN_BELOW;
    }

    public get isAtTop(): boolean {
        return this.scrollStatus === ScrollStatus.AT_TOP;
    }

    public get isAtBottom(): boolean {
        return this.scrollStatus === ScrollStatus.AT_BOTTOM;
    }

    public get maxBodyHeight(): number {
        return Math.max(0, this.optionHeight * this.config.behavior.maxVisibleOptions);
    }

    public getOptionFromIndex(index: number): Option {
        let groupStartIndex = 0;

        for (const group of this.groups) {
            if (index < 0 ) break;

            const groupEndIndex = Math.max(0, groupStartIndex + group.totalOptions - 1);

            if (index <= groupEndIndex) {
                const option = group.options[index - groupStartIndex];

                return option;
            }

            groupStartIndex += group.totalOptions;
        }

        return null;
    }

    public getOptionIndexFromValue(value: string): number {
        let index: number = -1;

        for (const group of this.groups) {
            for (const option of group.options) {
                index++;

                if (option.value === value) {
                    return index;
                }
            }
        }

        return index;
    }
}

export default State;