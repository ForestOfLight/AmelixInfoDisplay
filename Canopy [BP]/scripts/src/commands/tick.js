import { system, world } from '@minecraft/server'
import Command from 'stickycore/command'
import Utils from 'stickycore/utils'
import { DataTPS } from 'src/tps'

let targetMSPT = 50.0;
let shouldReset = false;
let shouldStep = 0;

system.beforeEvents.watchdogTerminate.subscribe((event) => {
    if (!world.getDynamicProperty('commandTick')) return;
    if (event.terminateReason === 'Hang' && targetMSPT > 50.0) {
        console.warn(`[Watchdog] Terminate hang ignored.`);
        event.cancel = true;
    }
});

system.runInterval(() => {
    if (shouldStep > 0) {
        shouldStep--;
        if (shouldStep == 0) world.sendMessage('§7Tick step complete.');
        return;
    }
    tickSpeed(targetMSPT);
});

new Command()
    .setName('tick')
    .addArgument('string|number', 'arg')
    .addArgument('number', 'steps')
    .setCallback(tickCommand)
    .build()

function tickCommand(sender, args) {
    if (!world.getDynamicProperty('commandTick')) return sender.sendMessage('§cThe commandTick feature is disabled.');
    const { arg, steps } = args;

    if (arg === null)
        return sender.sendMessage('§cUsage: ./tick <mspt> OR ./tick step [steps] OR ./tick reset');
    else if (arg === 'reset')
        return tickReset(sender);
    else if (arg === 'step')
        return tickStep(sender, steps);
    else if (Utils.isNumeric(arg))
        return tickSlow(sender, arg);
    els
        return sender.sendMessage('§cUsage: ./tick <mspt> OR ./tick step [steps] OR ./tick reset');
}

function tickSlow(sender, mspt) {
    if (mspt < 50.0)
        return sender.sendMessage('§cMSPT cannot be less than 50.0.');
    targetMSPT = mspt;
    world.sendMessage(`§7${sender.name} set the tick speed to ${mspt} mspt.`);
    tickSpeed(mspt);
}

function tickReset(sender) {
    shouldReset = true;
    targetMSPT = 50.0;
    world.sendMessage(`§7${sender.name} reset the tick speed.`);
}

function tickStep(sender, steps) {
    if (targetMSPT === 50.0)
        return sender.sendMessage('§cCannot step ticks without setting a tick speed.');
    if (steps === null || steps < 1)
        shouldStep = 1;
    else
        shouldStep = steps;
    world.sendMessage(`§7${sender.name} stepping ${shouldStep} tick(s)...`);
}

function tickSpeed(desiredMspt) {
    if (targetMSPT === 50.0) return;
    let currentMspt = Date.now() - DataTPS.lastTick;

    while (currentMspt <= desiredMspt) {
        currentMspt = Date.now() - DataTPS.lastTick;
    }
}
