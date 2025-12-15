package ma.investpro.service;

import lombok.RequiredArgsConstructor;
import ma.investpro.dto.CompteBancaireDTO;
import ma.investpro.entity.CompteBancaire;
import ma.investpro.exception.ResourceNotFoundException;
import ma.investpro.repository.CompteBancaireRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompteBancaireService {

    private final CompteBancaireRepository compteBancaireRepository;

    public List<CompteBancaireDTO> getAll() {
        return compteBancaireRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<CompteBancaireDTO> getAllActive() {
        return compteBancaireRepository.findByActifTrue().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public CompteBancaireDTO getById(Long id) {
        CompteBancaire compte = compteBancaireRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Compte bancaire", "id", id));
        return toDTO(compte);
    }

    public List<CompteBancaireDTO> search(String search) {
        return compteBancaireRepository.search(search).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public CompteBancaireDTO create(CompteBancaireDTO dto) {
        if (compteBancaireRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Un compte avec le code " + dto.getCode() + " existe déjà");
        }
        if (compteBancaireRepository.existsByRib(dto.getRib())) {
            throw new IllegalArgumentException("Un compte avec le RIB " + dto.getRib() + " existe déjà");
        }

        CompteBancaire compte = toEntity(dto);
        compte.setActif(true);
        CompteBancaire saved = compteBancaireRepository.save(compte);
        return toDTO(saved);
    }

    @Transactional
    public CompteBancaireDTO update(Long id, CompteBancaireDTO dto) {
        CompteBancaire compte = compteBancaireRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Compte bancaire", "id", id));

        if (!compte.getCode().equals(dto.getCode()) && compteBancaireRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Un compte avec le code " + dto.getCode() + " existe déjà");
        }
        if (!compte.getRib().equals(dto.getRib()) && compteBancaireRepository.existsByRib(dto.getRib())) {
            throw new IllegalArgumentException("Un compte avec le RIB " + dto.getRib() + " existe déjà");
        }

        updateEntityFromDTO(compte, dto);
        CompteBancaire updated = compteBancaireRepository.save(compte);
        return toDTO(updated);
    }

    @Transactional
    public void delete(Long id) {
        CompteBancaire compte = compteBancaireRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Compte bancaire", "id", id));
        compte.setActif(false);
        compteBancaireRepository.save(compte);
    }

    private CompteBancaireDTO toDTO(CompteBancaire entity) {
        return CompteBancaireDTO.builder()
            .id(entity.getId())
            .code(entity.getCode())
            .rib(entity.getRib())
            .banque(entity.getBanque())
            .agence(entity.getAgence())
            .typeCompte(entity.getTypeCompte())
            .titulaire(entity.getTitulaire())
            .devise(entity.getDevise())
            .remarques(entity.getRemarques())
            .actif(entity.getActif())
            .build();
    }

    private CompteBancaire toEntity(CompteBancaireDTO dto) {
        return CompteBancaire.builder()
            .code(dto.getCode())
            .rib(dto.getRib())
            .banque(dto.getBanque())
            .agence(dto.getAgence())
            .typeCompte(dto.getTypeCompte())
            .titulaire(dto.getTitulaire())
            .devise(dto.getDevise() != null ? dto.getDevise() : "MAD")
            .remarques(dto.getRemarques())
            .build();
    }

    private void updateEntityFromDTO(CompteBancaire entity, CompteBancaireDTO dto) {
        entity.setCode(dto.getCode());
        entity.setRib(dto.getRib());
        entity.setBanque(dto.getBanque());
        entity.setAgence(dto.getAgence());
        entity.setTypeCompte(dto.getTypeCompte());
        entity.setTitulaire(dto.getTitulaire());
        entity.setDevise(dto.getDevise() != null ? dto.getDevise() : "MAD");
        entity.setRemarques(dto.getRemarques());
        if (dto.getActif() != null) {
            entity.setActif(dto.getActif());
        }
    }
}
