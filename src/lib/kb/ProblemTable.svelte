<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { groupByProblem, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // tickets: problem → link to the ticket filed for it. outcome: problem → what engineering decided.
  let {
    ticket,
    tickets = {},
    outcome = {},
  }: { ticket: number; tickets?: Partial<Record<Problem, string>>; outcome?: Partial<Record<Problem, string>> } = $props();

  const total = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket).length);
  const groups = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const shift = $derived(groups.find((g) => g.problem === 'shift'));
</script>

<p class="sum">
  <strong>{total}</strong> unique reports merged into #{ticket} ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>outcome</th><th>ticket</th></tr></thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr class:open={!outcome[g.problem]}>
        <td><code>{g.problem}</code></td>
        <td>{g.reports}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{outcome[g.problem] ?? 'open'}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem]}>{tickets[g.problem]?.replace(/^.*\/issues\//, '#')}</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#if shift}
  <p class="note">{shift.reports} reports read as a one-day move: counted under <code>parser</code>, where the desk files them, and again as <code>shift</code>.</p>
{/if}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .open td { background: var(--warn-bg); }
</style>
