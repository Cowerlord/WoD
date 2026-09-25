import { reactive } from "vue";
import { MASQUERADE } from "../data/masquerade.js";
import { fetchCampaign, saveHeat } from "../api/campaign.js";

export const campaign = reactive({ heat: 0, loaded: false });

export async function loadCampaign() {
  const { data, error } = await fetchCampaign();
  if (error || !data) return;
  campaign.heat = data.heat;
  campaign.loaded = true;
}

export async function changeHeat(delta) {
  const heat = Math.min(MASQUERADE.max, Math.max(0, campaign.heat + delta));
  if (heat === campaign.heat) return;
  const prev = campaign.heat;
  campaign.heat = heat;
  const { data, error } = await saveHeat(heat);
  if (error || !data?.length) campaign.heat = prev;
}

export const heatLevel = () => [...MASQUERADE.levels].reverse().find(l => campaign.heat >= l.at) || null;

setInterval(() => { if (campaign.loaded && !document.hidden) loadCampaign(); }, 30000);
