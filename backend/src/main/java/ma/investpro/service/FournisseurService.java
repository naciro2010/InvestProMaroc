package ma.investpro.service;

import lombok.RequiredArgsConstructor;
import ma.investpro.dto.FournisseurDTO;
import ma.investpro.entity.Fournisseur;
import ma.investpro.exception.ResourceNotFoundException;
import ma.investpro.repository.FournisseurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FournisseurService {

    private final FournisseurRepository fournisseurRepository;

    public List<FournisseurDTO> getAll() {
        return fournisseurRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<FournisseurDTO> getAllActive() {
        return fournisseurRepository.findByActifTrue().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public FournisseurDTO getById(Long id) {
        Fournisseur fournisseur = fournisseurRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fournisseur", "id", id));
        return toDTO(fournisseur);
    }

    public List<FournisseurDTO> search(String search) {
        return fournisseurRepository.search(search).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public FournisseurDTO create(FournisseurDTO dto) {
        if (fournisseurRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Un fournisseur avec le code " + dto.getCode() + " existe déjà");
        }
        if (dto.getIce() != null && fournisseurRepository.existsByIce(dto.getIce())) {
            throw new IllegalArgumentException("Un fournisseur avec l'ICE " + dto.getIce() + " existe déjà");
        }

        Fournisseur fournisseur = toEntity(dto);
        fournisseur.setActif(true);
        Fournisseur saved = fournisseurRepository.save(fournisseur);
        return toDTO(saved);
    }

    @Transactional
    public FournisseurDTO update(Long id, FournisseurDTO dto) {
        Fournisseur fournisseur = fournisseurRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fournisseur", "id", id));

        if (!fournisseur.getCode().equals(dto.getCode()) && fournisseurRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Un fournisseur avec le code " + dto.getCode() + " existe déjà");
        }
        if (dto.getIce() != null && !dto.getIce().equals(fournisseur.getIce()) && fournisseurRepository.existsByIce(dto.getIce())) {
            throw new IllegalArgumentException("Un fournisseur avec l'ICE " + dto.getIce() + " existe déjà");
        }

        updateEntityFromDTO(fournisseur, dto);
        Fournisseur updated = fournisseurRepository.save(fournisseur);
        return toDTO(updated);
    }

    @Transactional
    public void delete(Long id) {
        Fournisseur fournisseur = fournisseurRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fournisseur", "id", id));
        fournisseur.setActif(false);
        fournisseurRepository.save(fournisseur);
    }

    private FournisseurDTO toDTO(Fournisseur entity) {
        return FournisseurDTO.builder()
            .id(entity.getId())
            .code(entity.getCode())
            .raisonSociale(entity.getRaisonSociale())
            .identifiantFiscal(entity.getIdentifiantFiscal())
            .ice(entity.getIce())
            .adresse(entity.getAdresse())
            .ville(entity.getVille())
            .telephone(entity.getTelephone())
            .fax(entity.getFax())
            .email(entity.getEmail())
            .contact(entity.getContact())
            .nonResident(entity.getNonResident())
            .remarques(entity.getRemarques())
            .actif(entity.getActif())
            .build();
    }

    private Fournisseur toEntity(FournisseurDTO dto) {
        return Fournisseur.builder()
            .code(dto.getCode())
            .raisonSociale(dto.getRaisonSociale())
            .identifiantFiscal(dto.getIdentifiantFiscal())
            .ice(dto.getIce())
            .adresse(dto.getAdresse())
            .ville(dto.getVille())
            .telephone(dto.getTelephone())
            .fax(dto.getFax())
            .email(dto.getEmail())
            .contact(dto.getContact())
            .nonResident(dto.getNonResident() != null ? dto.getNonResident() : false)
            .remarques(dto.getRemarques())
            .build();
    }

    private void updateEntityFromDTO(Fournisseur entity, FournisseurDTO dto) {
        entity.setCode(dto.getCode());
        entity.setRaisonSociale(dto.getRaisonSociale());
        entity.setIdentifiantFiscal(dto.getIdentifiantFiscal());
        entity.setIce(dto.getIce());
        entity.setAdresse(dto.getAdresse());
        entity.setVille(dto.getVille());
        entity.setTelephone(dto.getTelephone());
        entity.setFax(dto.getFax());
        entity.setEmail(dto.getEmail());
        entity.setContact(dto.getContact());
        entity.setNonResident(dto.getNonResident() != null ? dto.getNonResident() : false);
        entity.setRemarques(dto.getRemarques());
        if (dto.getActif() != null) {
            entity.setActif(dto.getActif());
        }
    }
}
