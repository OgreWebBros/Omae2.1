import React from 'react';
import PropTypes from 'prop-types';
import WeaponsComponent from './WeaponsComponent';
import ArmorsComponent from './ArmorsComponent';
import GearComponent from './GearComponent';
import priorityData from '../../data/priority.json';
import gearData from '../../data/gear.json';
import PropTypeChecking from '../../config/propTypeChecking';

import '../../styles/gear/StreetGear.scss';

class StreetGearComponent extends React.PureComponent {
	componentWillMount() {
		this.organizedGear = gearData.reduce((gearMemo, gear) => {
			return {
				...gearMemo,
				[gear.category]: [
					...(gearMemo[gear.category] || []),
					gear
				]
			};
		}, {});
	}

	render() {
		const {actions, purchaseGear, resourcesPriority} = this.props;
		const nuyen = priorityData[resourcesPriority].resources;
		return (
			<div className="streetgear-component">
				<p>Nuyen: <strong>{nuyen - (purchaseGear.nuyen)}&yen;</strong></p>
				<h3>Weapons</h3>
				<WeaponsComponent
					actions={actions}
					purchased={purchaseGear.weapons} />
				<h3>Armors</h3>
				<ArmorsComponent
					actions={actions}
					purchased={purchaseGear.armors} />
				<h3>Other Gear</h3>
				{
					Object.keys(this.organizedGear).map((gearCategory) => {
						const gear = this.organizedGear[gearCategory];

						return (
							<GearComponent
								gearData={gear}
								category={gearCategory}
								purchaseGear={actions.purchaseGear}
								sellGear={actions.sellGear}
								purchased={purchaseGear[gearCategory]}
							/>
						);
					})
				}
			</div>
		);
	}
}

StreetGearComponent.displayName = 'StreetGearComponent';

// Uncomment properties you need
StreetGearComponent.propTypes = {
	actions: PropTypeChecking.actions.isRequired,
	purchaseGear: PropTypeChecking.purchaseGear,
	resourcesPriority: PropTypes.string.isRequired
};
StreetGearComponent.defaultProps = {
	purchaseGear: null
};

export default StreetGearComponent;
