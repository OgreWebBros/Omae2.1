'use strict';

import React from 'react';
import Skillgroup from './SkillgroupsComponent';
let skillsData = require('json!../data/skills.json'),
	metatypeData = require('json!../data/metatype.json'),
	priorityTableData = require('json!../data/priority.json');

require('styles/skills/ActiveSkills.sass');

class ActiveSkillsComponent extends React.Component {
	render() {
		const {actions, priority, skills, attributes, metatype, magictype} = this.props,
			attAbriviation = {
				Agility: 'agi',
				Body: 'bod',
				Reaction: 'rea',
				Strength: 'str',
				Charisma: 'cha',
				Intuition: 'int',
				Logic: 'log',
				Will: 'wil',
				Magic: 'special',
				Resonance: 'special'
			},
			awakened = [
				'Mage',
				'Mystic',
				'Adept',
				'Aspected'
			],
			skillPointsLeft = priorityTableData[priority.skills].skills.skillpoints - skills.skillPointsSpent,
			groupPointsLeft = priorityTableData[priority.skills].skills.grouppoints - skills.groupPointSpent,
			baseMagicAttribute = priorityTableData[priority.magres].magic[magictype].attribute && priorityTableData[priority.magres].magic[magictype].attribute.points || 0,
			priorityDataFreeSkills = priorityTableData[priority.magres].magic[magictype].skills;

		function allowedSkill() {
			if(awakened.indexOf(magictype) > -1) {
				return 'Magic';
			} else if (magictype === 'Technomancer') {
				return 'Resonance';
			} else {
				return false;
			}
		}

		var listOfSkills = [];

		for(let skillKey in skillsData.active) {
			let skillinCategory = skillsData.active[skillKey];

			const attributeAbriv = attAbriviation[skillKey],
				baseAttribute = metatypeData[metatype].min[attributeAbriv] || baseMagicAttribute,
				attributePool = baseAttribute + attributes[attributeAbriv];


			listOfSkills.push(
				<ActiveSkill
					key={'skill-'+skillKey}
					skillAtt={skillKey}
					skillList={skillinCategory}
					actions={actions}
					skills={skills.active}
					skillPointsLeft={skillPointsLeft}
					showSkill={skills.showSkill === skillKey}
					attributePool={attributePool}
					restrictedSkills={attributeAbriv === 'special' ? skillKey!==allowedSkill() : false}
					/>
			);
		}

		if(priorityDataFreeSkills) {
			const freeAttribute = priorityDataFreeSkills.attribute,
				freeSkills = skillsData.active[freeAttribute];

			let freeSkillList = [];

			for(let freeSkillName in freeSkills) {
				let freeSkill = freeSkills[freeSkillName].name;
				freeSkillList.push(
					<option key={'free-skill--'+freeSkill}>{freeSkill}</option>
					);
			}

			let changeFreeSkill = (e) => {

				function genFreeSkillObj(skillName) {
					return {name: skillName, category: 'active', rating: priorityDataFreeSkills.rating, attribute: attAbriviation[freeAttribute]};
				}
				let updatedIndex = e.target.id,
					freeSkillsArr = skills.magicSkills.map((skillName)=>{
						return genFreeSkillObj(skillName);
					});

				freeSkillsArr[updatedIndex] = genFreeSkillObj(e.target.value);

				actions.setMagicSkills({
					magicSkills: freeSkillsArr});
			};

			var magicSkills = (
				<div>
					<h3>Free Skills</h3>
					<div className="row form-group">
						<div className="col-sm-6">
							<h4>Skill 1</h4>
							<select
								id="0"
								className="form-control"
								onChange={changeFreeSkill}
								value={skills.magicSkills[0]}>

								<option value=""></option>
								{freeSkillList}

							</select>
						</div>
						<div className="col-sm-6">
							<h4>Skill 2</h4>
							<select
								id="1"
								className="form-control"
								onChange={changeFreeSkill}
								value={skills.magicSkills[1]}>

								<option value=""></option>
								{freeSkillList}

							</select>
						</div>
					</div>
				</div>
			);
		}


		return (
			<div className="activeskills-component">
				{magicSkills}
				<h3>Skill Groups</h3>
				<div className="row">
					<Skillgroup
						skillgroups={skills.groups}
						skillgroupsData={skillsData.groups}
						actions={actions}
						pointsLeft = {groupPointsLeft}
						displaySkillgroups = {skills.showSkill === 'Skillgroup'}/>
				</div>

				<h3>Active Skills</h3>
				<div className="row">
					<div className="col-xs-12">
						{listOfSkills}
					</div>
				</div>
			</div>
		);
	}
}

const ActiveSkill = ({skillAtt, skillList, actions, skills, skillPointsLeft, showSkill, attributePool, restrictedSkills}) => {
	let skillTableData = [];

	for(let skillName in skillList) {
		let skillData = skillList[skillName],
		specilizationOptions = skillData.specializations.map((spec, i) => {
			return <option key={spec+i} value={spec}>{spec}</option>;
		}),
		references = [];
		for(let book in skillData.reference) {
			references.push(<span key={skillName + book} className="reference">
					{book} p{skillData.reference[book].page}
				</span>);
		}

		function incrementSkill(name, att, rating) {
			if(skillPointsLeft > 0 && rating < 6){
				actions.incrementSkill({name: name, category: 'active', max: 6, attribute: att});
			}
		}

		function decrementSkill(name, att) {
			actions.decrementSkill({name: name, category: 'active', max: 6, attribute: att});
		}

		function changeSpec(changeEvent) {
			if(skillPointsLeft > 0){
				let newSpec = changeEvent.target.value;
				actions.setSpec({name: skillData.name, category: 'active', spec: newSpec});
			}
		}

		const currSkill = skills[skillData.name],
			currentSpec = skills[skillData.name] && skills[skillData.name].spec || '';
			
		let rating = 0,
			dicePool = attributePool;

		for(let prop in currSkill) {
			let currRating = currSkill[prop];

			if(typeof currRating === 'number') {
				rating += currRating;
				dicePool += currRating;
			}
		}

		skillTableData.push(
			<tr key={skillData.name} className={rating > 6 || restrictedSkills?'table-danger ':''}>
				<td>
					<button
						className="btn btn-success"
						onClick={incrementSkill.bind(this, skillData.name, skillData.stat, rating)}
					>
						+
					</button>
				</td>
				<td>
					{rating}
				</td>
				<td>
					<button
						className="btn btn-warning"
						onClick={decrementSkill.bind(this, skillData.name, skillData.stat)}
					>
						-
					</button>
				</td>
				<td>
					<strong>{skillData.name}</strong>
				</td>
				<td>
					{references}
				</td>
				<td>
					<input
						type="text"
						className="form-control"
						placeholder="Custom Spec"
						onChange={changeSpec}
						value={currentSpec}/>
					<select
						className="form-control"
						onChange={changeSpec}
						value={currentSpec}>
						<option value="">–</option>
						{specilizationOptions}
					</select>
				</td>
				<td>{currentSpec ? 2 : 0}</td>
				<td>{dicePool}{currentSpec ? `(${dicePool+2})` : null}</td>
			</tr>
		);
	}

	return (
		<div className="table-responsive">
			<h4><button className={'btn ' + (restrictedSkills ? 'btn-danger':'btn-info')} onClick={()=> actions.showSkill({ skillToShow: skillAtt })}>{skillAtt}</button></h4>
			<div className={showSkill ? 'collapse in' : 'collapse'}>
				<table className="table">
					<thead>
						<tr>
							<th>Raise</th>
							<th>Rating</th>
							<th>Lower</th>
							<th>Skill Name</th>
							<th>Ref</th>
							<th>Spec</th>
							<th>Mods</th>
							<th>Dice Pool</th>
						</tr>
					</thead>
					<tbody>
						{skillTableData}
					</tbody>
				</table>
			</div>
		</div>
	);
};

ActiveSkillsComponent.displayName = 'SkillsActiveSkillsComponent';

// Uncomment properties you need
// ActiveSkillsComponent.propTypes = {};
// ActiveSkillsComponent.defaultProps = {};

export default ActiveSkillsComponent;
