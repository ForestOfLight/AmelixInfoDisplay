class Utils {
	static ticksToTime(ticks) {
		const ticksPerDay = 24000;
		const ticksPerHour = ticksPerDay / 24;
		ticks = (ticks + 6 * ticksPerHour) % ticksPerDay; // 0 ticks is 6:00 AM in game
		
		let hours = Math.floor(ticks / ticksPerHour);
		const minutes = Math.floor((ticks % ticksPerHour) * 60 / ticksPerHour);
		
		let period = 'AM';
		if (hours >= 12) period = 'PM';
		if (hours >= 13) hours -= 12;
		else if (hours === 0) hours = 12;
	
		const formattedHours = hours.toString().padStart(2, '0');
		const formattedMinutes = minutes.toString().padStart(2, '0');
	
		return `${formattedHours}:${formattedMinutes} ${period}`;
	}

    static calcDistance(locationOne, locationTwo, useZ = true) {
		const x = locationOne.x - locationTwo.x;
		const y = locationOne.y - locationTwo.y;
		if (!useZ) return Math.sqrt(x*x + y*y);
		const z = locationOne.z - locationTwo.z;
		return Math.sqrt(x*x + y*y + z*z);
	}

    static isNumeric(str) {
        return !isNaN(Number(str)) && isFinite(str);
    }

	static parseLookingAtBlock(lookingAtBlock) {
		let block;
		let blockName = '';
		let raycastHitFace;

		block = lookingAtBlock?.block ?? undefined;
		if (block) {
			raycastHitFace = lookingAtBlock.face;
			try {
				blockName = `§a${Utils.parseName(block)}`;
			} catch (error) {
				if (error.message.includes('loaded')) {
					blockName = `§c${Utils.stringifyLocation(block.location, 0)} Unloaded`;
				} else if (error.message.includes('undefined')) {
					blockName = '§7Undefined';
				}
			}
			if (blockName === `§aminecraft:redstone_wire`) blockName += `§7: §c` + block.permutation.getState('redstone_signal');
		}

		return { LookingAtName: blockName, LookingAtFace: raycastHitFace, LookingAtLocation: block?.location, LookingAtBlock: block };
	}

	static parseLookingAtEntity(lookingAtEntities) {
		let entity;
		let entityName;

		entity = lookingAtEntities[0]?.entity ?? undefined;
		if (entity) {
			try {
				entityName = `§a${Utils.parseName(entity)}`;

				if (entity.typeId === 'minecraft:player') {
					entityName = `§a§o${entity.name}§r`;
				}
			} catch (error) {
				if (error.message.includes('loaded')) {
					entityName = `§c${Utils.stringifyLocation(entity.location, 0)} Unloaded`;
				} else if (error.message.includes('undefined')) {
					entityName = '§7Undefined';
				}
			}
		}

		return { LookingAtName: entityName, LookingAtEntity: entity }
	}

	static getClosestTarget(player, blockRayResult, entityRayResult) {
		let entity;
		let block;
		let entityDist;
		let blockDist;
		
		if (entityRayResult.length > 0) entity = entityRayResult[0]?.entity;
		if (blockRayResult) block = blockRayResult.block;
		if (!entity) return block;
		if (!block) return entity;
		entityDist = Utils.calcDistance(player.getHeadLocation(), entity.location);
		blockDist = Utils.calcDistance(player.getHeadLocation(), block.location);
	
		return entityDist < blockDist ? entity : block;
	}

	static parseName(target, includePrefix = true) {
		let targetId;

		targetId = includePrefix ? target.typeId : target.typeId.replace('minecraft:', '');
		if (targetId === 'player') targetId = `§o${target.name}§r`;

		return targetId;
	}

	static parseName(target, includePrefix = true) {
		return target.typeId === 'player' ? `§o${target.name}§r` : (includePrefix ? target.typeId : target.typeId.replace('minecraft:', ''));
	}

	static stringifyLocation(location, precision) {
		return `[${location.x.toFixed(precision)}, ${location.y.toFixed(precision)}, ${location.z.toFixed(precision)}]`
	}

	static populateItems(inventory) {
		let items = {};
	
		inventory = inventory.container;
		for (let i=0; i<inventory.size; i++) {
			try {
				const item = inventory.getSlot(i);
				
				let data = item.typeId.replace('minecraft:','');
				if (items[data]) items[data] += item.amount;
				else items[data] = item.amount;
			} catch {}
		}
	
		return items;
	}

	static getColorCode(color) {
		switch (color) {
			case 'red': return '§c';
			case 'orange': return '§6';
			case 'yellow': return '§e';
			case 'lime': return '§a';
			case 'green': return '§2';
			case 'cyan': return '§3';
			case 'light_blue': return '§b';
			case 'blue': return '§9';
			case 'purple': return '§5';
			case 'pink': return '§d';
			case 'magenta': return '§d';
			case 'brown': return '§6';
			case 'black': return '§0';
			case 'white': return '§f';
			case 'light_gray': return '§7';
			case 'gray': return '§8';
			default: return '';
		}
	};
}

export default Utils;