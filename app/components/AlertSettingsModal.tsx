"use client";

/**
 * Composant modal pour configurer les paramètres d'alerte d'un produit
 * Permet de définir la quantité minimale et activer/désactiver les alertes
 */

import { useState } from "react";
import { toast } from "react-toastify";
import { updateProductAlertSettings } from "@/app/actions/index";

interface AlertSettingsModalProps {
  productId: string;
  productName: string;
  currentMinQuantity: number;
  currentAlertEnabled: boolean;
  onSave?: () => void;
}

const AlertSettingsModal = ({
  productId,
  productName,
  currentMinQuantity,
  currentAlertEnabled,
  onSave,
}: AlertSettingsModalProps) => {
  const [minQuantity, setMinQuantity] = useState(currentMinQuantity);
  const [alertEnabled, setAlertEnabled] = useState(currentAlertEnabled);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProductAlertSettings(productId, minQuantity, alertEnabled);
      toast.success("Paramètres d'alerte mis à jour");
      onSave?.();
      // Ferme le modal
      (
        document.getElementById(`alert_modal_${productId}`) as HTMLDialogElement
      )?.close();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog id={`alert_modal_${productId}`} className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">
          Paramètres d'alerte - {productName}
        </h3>

        <div className="space-y-4">
          {/* Quantité minimale */}
          <div className="form-control space-x-6">
            <label className="label">
              <span className="label-text">Quantité minimale</span>
            </label>
            <input
              type="number"
              className="input input-bordered"
              value={minQuantity}
              onChange={(e) => setMinQuantity(Number(e.target.value))}
              min="0"
            />
            <label className="label">
              <span className="label-text-alt">
                Une alerte sera créée quand le stock passe sous cette limite
              </span>
            </label>
          </div>

          {/* Toggle alerte */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Activer les alertes</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={alertEnabled}
                onChange={(e) => setAlertEnabled(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-ghost">Annuler</button>
          </form>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default AlertSettingsModal;
