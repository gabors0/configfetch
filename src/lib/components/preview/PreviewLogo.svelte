<script lang="ts">
	import chafaLogo from '$lib/assets/chafa.txt?raw';
	import debianAnimation from '$lib/assets/debian.gif';
	import debianLogo from '$lib/assets/debian.svg';
	import type { LogoConfig } from '$lib/config/types';

	let { logo, color = '' }: { logo: LogoConfig; color?: string } = $props();

	function padding(side: 'top' | 'left' | 'right') {
		const value =
			typeof logo.padding === 'object' &&
			logo.padding !== null &&
			typeof (logo.padding as Record<string, unknown>)[side] === 'number'
				? (logo.padding as Record<string, number>)[side]
				: 0;

		return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
	}
</script>

<div
	class="shrink-0"
	style:padding-top={`${padding('top')}lh`}
	style:padding-left={`${padding('left')}ch`}
	style:padding-right={`${padding('right')}ch`}
	style={['auto', 'builtin', 'small', 'file', 'data'].includes(String(logo.type)) ? color : ''}
>
	{#if logo.type == 'none'}
		<pre></pre>
	{:else if logo.type == 'auto' || logo.type == 'builtin'}
		<pre>
          _,met$$$$$gg.
       ,g$$$$$$$$$$$$$$$P.
     ,g$$P""       """Y$$.".
    ,$$P'              `$$$.
  ',$$P       ,ggs.     `$$b:
  `d$$'     ,$P"'   .    $$$
   $$P      d$'     ,    $$P
   $$:      $$.   -    ,d$$'
   $$;      Y$b._   _,d$P'
   Y$$.    `.`"Y$$$$P"'
   `$$b      "-.__
    `Y$$b
     `Y$$.
       `$$b.
         `Y$$b.
           `"Y$b._
               `""""</pre>
	{:else if logo.type == 'small'}
		<pre>
    _____ 
   /  __ \
  |  /    |
  |  \___-
  -_
    --_ </pre>
	{:else if logo.type == 'file' || logo.type == 'file-raw'}
		<pre>
__/\\\________/\\\_______        
 _\/\\\_______\/\\\_______       
  _\/\\\_______\/\\\__/\\\_      
   _\/\\\\\\\\\\\\\\\_\///__     
    _\/\\\/////////\\\__/\\\_    
     _\/\\\_______\/\\\_\/\\\_   
      _\/\\\_______\/\\\_\/\\\_  
       _\/\\\_______\/\\\_\/\\\_ 
        _\///________\///__\///__</pre>
	{:else if logo.type == 'data' || logo.type == 'data-raw'}
		Hi
	{:else if logo.type == 'command-raw'}
		output of<br />command
	{:else if logo.type == 'kitty' || logo.type == 'kitty-direct' || logo.type == 'sixel' || logo.type == 'iterm' || logo.type == 'raw'}
		<img src={debianLogo} alt="Debian logo" class="h-48 w-48" />
	{:else if logo.type == 'kitty-icat'}
		<img src={debianAnimation} alt="Debian logo but animated" class="w-48" />
	{:else if logo.type == 'chafa'}
		<pre>{chafaLogo}</pre>
	{/if}
</div>
